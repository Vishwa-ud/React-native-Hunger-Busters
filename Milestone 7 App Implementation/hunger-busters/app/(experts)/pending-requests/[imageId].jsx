import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { BlurView } from "expo-blur";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from "../../../components/CustomButton";
import TransparentTopBar from "../../../components/TransparentTopBar";

const timeOptions = [6, 12, 24, 1, 3, 7, 30, 60];

const PendingRequests = () => {
  const [formState, setFormState] = useState({
    selectedTag: "Pending",
    currentImageIndex: 0,
    foodLifeTime: undefined,
    title: "",
    description: "",
    status: "",
    deliveryDate: "",
    submissionDate: "",
    images: [],
  });
  const [submissionStatus, setSubmissionStatus] = useState(""); // New state for submission status
  const { imageId } = useLocalSearchParams();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const router = useRouter();

  // Fetch data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/fsr/get/${imageId}`);
        const data = await response.json();
        setFormState((prev) => ({
          ...prev,
          title: data.title,
          description: data.description,
          status: data.status,
          deliveryDate: data.deliveryDate,
          submissionDate: data.submissionDate,
          images: data.images,
          foodLifeTime: data.foodLifeTime,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (imageId) {
      fetchData();
    }
  }, [imageId]);

  const nextImage = () => {
    setFormState((prev) => ({
      ...prev,
      currentImageIndex: Math.min(prev.currentImageIndex + 1, prev.images.length - 1),
    }));
  };

  const prevImage = () => {
    setFormState((prev) => ({
      ...prev,
      currentImageIndex: Math.max(prev.currentImageIndex - 1, 0),
    }));
  };

  const handleApprove = async () => {
    setSubmissionStatus("Submitting..."); // Set submission status
    try {
  
      const response = await fetch(`${apiUrl}/api/fsr/put/submit/${imageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: formState.selectedTag,
          foodLifeTime: formState.foodLifeTime,
        }),
      });
  
      // Check if response is OK
      if (response.ok) {
        const responseData = await response.json(); // Parse the JSON response
        setSubmissionStatus(responseData.message);
  
        // Show success alert and wait for 2 seconds before navigating back
        Alert.alert(
          "Success", 
          responseData.message, 
          [
            {
              text: "OK",
              onPress: () => {
                setTimeout(() => {
                  router.push("/expert-dashboard");
                }, 100); // 0.1-second delay
              }
            }
          ]
        );
      } else {
        const errorData = await response.json(); // Parse error response
        setSubmissionStatus(`Submission failed: ${errorData.message}`); // Set the error message
      }
    } catch (error) {
      console.error("Error submitting data:", error);
      setSubmissionStatus("An error occurred during submission."); // Handle network or other errors
    }
  };

  const handleIncrementTime = () => {
    if (formState.selectedTag !== "Expired") {
      const currentIndex = timeOptions.indexOf(formState.foodLifeTime);
      if (currentIndex < timeOptions.length - 1) {
        setFormState((prev) => ({
          ...prev,
          foodLifeTime: timeOptions[currentIndex + 1],
        }));
      }
    }
  };

  const handleDecrementTime = () => {
    if (formState.selectedTag !== "Expired") {
      const currentIndex = timeOptions.indexOf(formState.foodLifeTime);
      if (currentIndex > 0) {
        setFormState((prev) => ({
          ...prev,
          foodLifeTime: timeOptions[currentIndex - 1],
        }));
      }
    }
  };

  const handleBackPress = () => {
    router.push("/expert-dashboard");
  };

  return (
    <SafeAreaView className="flex-1 bg-white relative">
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="flex-grow">
        <TransparentTopBar title={formState.title} onBackPress={handleBackPress} />
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingTop: 60 }}>
          <View className="items-center relative mb-4">
            <TouchableOpacity
              style={{ position: "absolute", left: 10, top: "50%", transform: [{ translateY: -12 }] }}
              onPress={prevImage}
            >
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <BlurView intensity={90} tint="light" className="h-56 w-64 rounded-lg overflow-hidden border border-black">
              <Image
                source={{ uri: formState.images[formState.currentImageIndex]?.source }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </BlurView>
            <TouchableOpacity
              style={{ position: "absolute", right: 10, top: "50%", transform: [{ translateY: -12 }] }}
              onPress={nextImage}
            >
              <Ionicons name="chevron-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <BlurView intensity={90} tint="light" className="rounded-lg p-4 my-2 mx-4 border border-black">
            <Text className="font-bold">Submission Date:</Text>
            <Text>{new Date(formState.submissionDate).toLocaleDateString()}</Text>

            <Text className="font-bold mt-2">Provided Description:</Text>
            <Text>{formState.description}</Text>

            <Text className="font-bold mt-2">Current Status:</Text>
            <Text>{formState.status}</Text>

            <Text className="font-bold mt-2">Approx. Location:</Text>
            <Text>Location Placeholder</Text>

            <Text className="font-bold mt-2">Delivery Date:</Text>
            <Text>{new Date(formState.deliveryDate).toLocaleDateString()}</Text>
          </BlurView>

          <BlurView intensity={90} tint="light" className="rounded-lg p-4 my-2 mx-4 border border-black">
            <View className="flex-row items-center justify-between mt-2">
              <TouchableOpacity className="bg-gray-300 p-2 rounded-lg" onPress={handleDecrementTime}>
                <Ionicons name="remove" size={24} color="black" />
              </TouchableOpacity>
              <Text>
                {formState.selectedTag === "Expired"
                  ? "NOT AVAILABLE"
                  : `${formState.foodLifeTime} ${formState.foodLifeTime >= 24 ? "Days" : "Hours"}`}
              </Text>
              <TouchableOpacity className="bg-gray-300 p-2 rounded-lg" onPress={handleIncrementTime}>
                <Ionicons name="add" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </BlurView>

          <BlurView intensity={90} tint="light" className="px-4 py-3 rounded-lg mx-4 border border-black">
            <Text className="mb-2 font-bold">Assign Tag</Text>
            <View className="border rounded-lg overflow-hidden">
              <Picker
                selectedValue={formState.selectedTag}
                onValueChange={(itemValue) => setFormState((prev) => ({ ...prev, selectedTag: itemValue }))}
              >
                <Picker.Item label="Select Tag" value="Pending" />
                <Picker.Item label="Approved" value="Approved" />
                <Picker.Item label="Rejected" value="Rejected" />
                <Picker.Item label="Expired" value="Expired" />
              </Picker>
            </View>
          </BlurView>

          <View className="mt-4 mb-[70px] px-4">
            {submissionStatus ? (
              <Text className="text-center text-red-600">{submissionStatus}</Text>
            ) : null}
            <CustomButton
              title="Submit"
              handlePress={handleApprove}
              containerStyles="w-full mb-4"
              textStyles="text-lg"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
 
export default PendingRequests;
