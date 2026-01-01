import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
const apiUrl = process.env.EXPO_PUBLIC_API_URL; // Adjust this according to your environment variable setup

const ListSurplusFood = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [foodData, setFoodData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchFoodData();
  }, []);

  // Fetch food data from the API
  const fetchFoodData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`${apiUrl}/api/fsr/get/food-data`);
      const data = await response.json();

      // Combine pending, on refrigerator, and approved food data
      const combinedData = [
        ...data.pendingApprovals,
        ...data.onRefrigerator,
        ...data.approved,
      ];

      setFoodData(combinedData); // Set the combined data to the state
      setLoading(false);
    } catch (error) {
      console.error("Error fetching food data:", error);
      setError(true);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFoodData().finally(() => setRefreshing(false));
  };

  const handleRetry = () => {
    fetchFoodData();
  };

  const handleFoodItemPress = (id) => {
    if (!id) {
      Alert.alert("No ID found");
      return;
    }
    router.push(`/food-detail/${id}`); // Navigate to detailed food page with the item's ID
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-red-500">
          Failed to load food data. Check your network connection.
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          className="bg-blue-500 p-3 mt-3 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderFoodItem = ({ item }) => {
    const { id, description, images } = item;
    const truncatedDescription =
      description && description.length > 100
        ? `${description.substring(0, 100)}...`
        : description || "No description available";

    return (
      <View className="relative mb-10 w-[47%] shadow-xl rounded-xl overflow-hidden bg-white">
        
        {/* Card Image */}
        {images && images.length > 0 && images[0].source ? (
          <Image
            source={{ uri: images[0].source }}
            className="w-full h-44 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="flex justify-center items-center w-full h-44 bg-gray-300 rounded-t-xl">
            <Text className="text-gray-500">No Image Available</Text>
          </View>
        )}

        {/* Description */}
        <View className="absolute top-0 left-0 w-full p-4 bg-black/30 backdrop-blur-md">
          <Text className="text-white text-xs font-medium leading-5">
            {truncatedDescription}
          </Text>
        </View>

        {/* View Details Button */}
        {id && (
          <View className="absolute bottom-4 left-0 right-0 mx-auto w-full items-center">

          </View>
        )}
      </View>
    );
  };

  return (
    <>
    <LinearGradient
      colors={['#000000', '#1a1a2e', '#16213e']}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    />
    <SafeAreaView className="flex-1 bg-pink mb-10">
      <FlatList
        data={foodData}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingTop: 100, paddingHorizontal: 10,  }}
      />
    </SafeAreaView>
    </>
  );
};

export default ListSurplusFood;
