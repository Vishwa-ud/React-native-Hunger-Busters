import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { images } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const Home = () => {
  const [userRole, setUserRole] = useState(null);

  // Fetch the user role from AsyncStorage
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
      } catch (error) {
        console.log('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  return (
    <>
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        <ScrollView className="px-4">
          {/* Header Section */}
          <View className="flex-row justify-between items-center mt-8">
            <View>
              <Text className="text-base text-gray-100">Welcome To</Text>
              <Text className="text-3xl font-bold text-white">
                HungerBusters
              </Text>
            </View>
            <Image
              source={images.logo}
              className="w-14 h-14"
              resizeMode="contain"
            />
          </View>

          {/* Grid with buttons */}
          <View className="flex flex-row flex-wrap justify-between mt-10">
            {/* Donations */}
            <View className="w-[47%] h-[200px] bg-teal-400/80 rounded-xl shadow-lg mb-4">
              <View className="p-4 flex-1 justify-between">
                <MaterialIcons name="volunteer-activism" size={36} color="white" />
                <Text className="text-xl text-white mt-2">Donations</Text>
                <CustomButton
                  title="Donate Now"
                  handlePress={() => router.push('/donations')}
                  containerStyles="mt-auto bg-white"
                  textStyles="text-teal-600"
                />
              </View>
            </View>

            {/* Experts Button - Conditional Rendering */}
            <View
              className={`w-[47%] h-[200px] rounded-xl shadow-lg mb-4 ${
                userRole === 'expert' ? 'bg-sky-950/90' : 'bg-gray-200/30'
              }`}
            >
              <View className="p-4 flex-1 justify-between">
                <FontAwesome5
                  name="user-tie"
                  size={36}
                  color={userRole === 'expert' ? 'white' : 'gray'}
                />
                <Text className="text-xl mt-2 text-white">
                  Experts
                </Text>
                {userRole === 'expert' ? (
                  <CustomButton
                    title="Check"
                    handlePress={() => router.push('/expert-dashboard')}
                    containerStyles="mt-auto bg-white"
                    textStyles="text-sky-950/90"
                  />
                ) : (
                  <Text className="mt-auto text-center text-gray-600 pb-6">
                    Only Experts Allowed
                  </Text>
                )}
              </View>
            </View>

           

            {/* Food Details */}
            <View className="w-[47%] h-[200px] bg-blue-600/80 rounded-xl shadow-lg mb-4">
              <View className="p-4 flex-1 justify-between">
                <MaterialIcons name="fastfood" size={36} color="white" />
                <Text className="text-xl text-white mt-2">Food Details</Text>
                <CustomButton
                  title="View"
                  handlePress={() => router.push('/FoodList')}
                  containerStyles="mt-auto bg-white"
                  textStyles="text-blue-600"
                />
              </View>
            </View>

            {/* Food Recipes */}
            <View className="w-[47%] h-[200px] bg-orange-400/80 rounded-xl shadow-lg mb-4">
              <View className="p-4 flex-1 justify-between">
                <FontAwesome5 name="utensils" size={36} color="white" />
                <Text className="text-xl text-white mt-2">Food Recipes</Text>
                <CustomButton
                  title="Browse"
                  handlePress={() => router.push('/RecipeList')}
                  containerStyles="mt-auto bg-white"
                  textStyles="text-orange-600"
                />
              </View>
            </View>
          </View>
           {/* Health */}
           <View className="w-[100%] h-[200px] bg-yellow-400/80 rounded-xl shadow-lg mb-4">
              <View className="p-4 flex-1 justify-between">
                <MaterialIcons name = "star" size={36} color="white" />
                <Text className="text-xl text-white mt-2">Food - Listing</Text>
                <CustomButton
                  title="View"
                  handlePress={() => router.push('/landing')}
                  containerStyles="mt-auto bg-white"
                  textStyles="text-yellow-600"
                />
              </View>
            </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Home;
