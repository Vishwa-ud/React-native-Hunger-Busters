import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import TransparentTopBar from '../../components/TransparentTopBar';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';


const DonationRequests = () => {
  const handleBackPress = () => {
    router.push("/admin-dashboard");
  };
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // New filter state
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const fetchDonationRequests = async () => {
    try {
      const [schoolResponse, elderResponse] = await Promise.all([
        axios.get(`${apiUrl}/api/v1/school-donations`),
        axios.get(`${apiUrl}/api/v1/elder-donations`),
      ]);

      const combinedRequests = [
        ...schoolResponse.data.map(request => ({ ...request, type: 'school' })),
        ...elderResponse.data.map(request => ({ ...request, type: 'elder' })),
      ];

      setRequests(combinedRequests);
      setLoading(false);
    } catch (err) {
      setError('Failed to load donation requests.');
      setLoading(false);
      console.error('Error fetching donation requests:', err);
    }
  };

  useEffect(() => {
    fetchDonationRequests();
  }, []);

  const approveRequest = async (id, type) => {
    Alert.alert(
      "Confirm Approval",
      "Are you sure you want to approve this donation request?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
          try {
            await axios.put(`${apiUrl}/api/v1/${type}-donations/${id}/approve`);
            setRequests(prevRequests => 
              prevRequests.map(request => 
                request._id === id ? { ...request, approved: true } : request
              )
            );
            Alert.alert("Success", "You have approved the donation request.");
          } catch (err) {
            Alert.alert("Error", "Failed to approve the donation request.");
            console.error('Error approving request:', err);
          }
        }}
      ]
    );
  };

  const unapproveRequest = async (id, type) => {
    Alert.alert(
      "Confirm Unapproval",
      "Are you sure you want to unapprove this donation request?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
          try {
            await axios.put(`${apiUrl}/api/v1/${type}-donations/${id}/unapprove`);
            setRequests(prevRequests => 
              prevRequests.map(request => 
                request._id === id ? { ...request, approved: false } : request
              )
            );
            Alert.alert("Success", "You have unapproved the donation request.");
          } catch (err) {
            Alert.alert("Error", "Failed to unapprove the donation request.");
            console.error('Error unapproving request:', err);
          }
        }}
      ]
    );
  };

  const deleteRequest = async (id, type) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this donation request?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
          console.log(`Deleting from: ${apiUrl}/api/v1/${type}-donations/${id}`);
          try {
            await axios.delete(`${apiUrl}/api/v1/${type}-donations/${id}`);
            setRequests(prevRequests => prevRequests.filter(request => request._id !== id));
            Alert.alert("Success", "Donation request deleted successfully.");
          } catch (err) {
            Alert.alert("Error", "Failed to delete the donation request.");
            console.error('Error deleting request:', err);
          }
        }}
      ]
    );
  };

  const filteredRequests = requests.filter(request => {
    const isApproved = filter === 'approved' ? request.approved : true;
    const isPending = filter === 'pending' ? !request.approved : true;
    const matchesSearch = request.type === 'school' ? request.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) : request.elderHomeName.toLowerCase().includes(searchQuery.toLowerCase());
    return (isApproved && isPending) && matchesSearch;
  });

  const approvedCount = filteredRequests.filter(request => request.approved).length;
  const pendingCount = filteredRequests.filter(request => !request.approved).length;

  const renderItem = ({ item }) => (
    <View className={`bg-white rounded-lg p-5 mb-4 shadow-lg w-full transition-transform transform ${item.approved ? 'bg-green-50' : ''}`}>
      <Text className="text-lg font-semibold">
        {item.type === 'school' ? item.schoolName : item.elderHomeName}
      </Text>
      {item.approved ? (
        <>
          <Text className="text-green-500 font-semibold mt-2">Approved</Text>
          <TouchableOpacity
            className="bg-yellow-500 py-2 px-4 rounded-lg mt-3"
            onPress={() => unapproveRequest(item._id, item.type)}
          >
            <Text className="text-white text-center font-semibold">Unapprove Request</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          className="bg-green-500 py-3 px-5 rounded-lg mt-3 transition-transform active:scale-95"
          onPress={() => approveRequest(item._id, item.type)}
        >
          <Text className="text-white text-center font-semibold">Approve Request</Text>
        </TouchableOpacity>
      )}

      {/* Delete Button */}
      <TouchableOpacity
        className="bg-red-500 py-2 px-4 rounded-lg mt-3"
        onPress={() => deleteRequest(item._id, item.type)}
      >
        <Text className="text-white text-center font-semibold">Delete Request</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg">Loading donation requests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <>
    <LinearGradient
      colors={['#000000', '#1a1a2e', '#16213e']}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    />
    <View className="flex-1 p-7">
      
      <View className="pt-10 pb-3">
      <TransparentTopBar
        title="Donation Requests"
        onBackPress={handleBackPress}
      />
    </View>
      {/* Search Bar */}
      <TextInput
        placeholder="Search requests..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="mb-4 p-2  border border-black text-cyan-300 rounded"
      />

      {/* Filter Options */}
      <View className="flex-row mb-4">
        <TouchableOpacity onPress={() => setFilter('all')} className={`p-2 rounded ${filter === 'all' ? 'bg-gray-300' : ''}`}>
          <Text>All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('approved')} className={`p-2 rounded ${filter === 'approved' ? 'bg-gray-300' : ''}`}>
          <Text>Approved</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFilter('pending')} className={`p-2 rounded ${filter === 'pending' ? 'bg-gray-300' : ''}`}>
          <Text>Pending</Text>
        </TouchableOpacity>
      </View>

      {/* Approved, Pending, and Total Count Display */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 bg-green-100 rounded-lg p-4 mr-2 shadow-md">
          <MaterialIcons name="check-circle" size={24} color="green" />
          <Text className="text-sm font-semibold mt-2">Approved</Text>
          <Text className="text-2xl font-bold text-green-600">{approvedCount}</Text>
        </View>

        <View className="flex-1 bg-yellow-100 rounded-lg p-4 mx-2 shadow-md">
          <MaterialIcons name="hourglass-empty" size={24} color="orange" />
          <Text className="text-sm font-semibold mt-2">Pending</Text>
          <Text className="text-2xl font-bold text-yellow-600">{pendingCount}</Text>
        </View>

        <View className="flex-1 bg-blue-100 rounded-lg p-4 ml-2 shadow-md">
          <MaterialIcons name="dashboard" size={24} color="blue" />
          <Text className="text-sm font-semibold mt-2">Total</Text>
          <Text className="text-2xl font-bold text-blue-600">{filteredRequests.length}</Text>
        </View>
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
    </>
  );
};

export default DonationRequests;
