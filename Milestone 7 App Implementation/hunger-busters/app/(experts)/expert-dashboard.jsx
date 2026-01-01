import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Table, Row, Rows } from "react-native-table-component";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import TransparentTopBar from "../../components/TransparentTopBar";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const ExpertDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [requestData, setRequestData] = useState({});
  const [tableData, setTableData] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);


  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data from the API
  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`${apiUrl}/api/fsr/get/dashboard-data`);
      const data = await response.json();

      setRequestData({
        approved: data.approved,
        total: data.total,
        expired: data.expired,
        pending: data.pending,
      });
      setTableData(data.tableData);
      setPendingApprovals(data.pendingApprovals);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(true);
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  };

  const handleRetry = () => {
    fetchData();
  };

  const handleBackPress = () => {
    router.push("/home");
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <SkeletonLoader handleBackPress={handleBackPress} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-red-500">
          Failed to load data. Check your network connection.
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

  const renderDashboardContent = () => {
    return (
      <>
        <View className="px-4 mt-3">
          <View className="flex-row justify-between mb-4">
            <SummaryCard
              title="Approved Requests"
              value={requestData.approved}
              color="bg-green-200/80"
            />
            <SummaryCard
              title="Total Requests"
              value={requestData.total}
              color="bg-yellow-300/80"
            />
          </View>
          <View className="flex-row justify-between">
            <SummaryCard
              title="Expired Requests"
              value={requestData.expired}
              color="bg-red-400/80"
            />
            <SummaryCard
              title="Pending Requests"
              value={requestData.pending}
              color="bg-teal-500/80"
            />
          </View>
        </View>

        <View className="mt-5 p-3 rounded-2xl shadow bg-teal-500/40">
          <TouchableOpacity onPress={() => router.push("/analysis-dashboard")}>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#DDDDDD" }}>
              <Row
                data={["Date", "Status", "Expiry", "Delivery"]}
                style={{ height: 40, backgroundColor: "#f1f1f1" }}
                textStyle={{
                  fontWeight: "600",
                  textAlign: "center",
                  color: "#333",
                }}
              />
              <Rows
                data={tableData}
                textStyle={{ margin: 6, textAlign: "center", color: "#000" }}
              />
            </Table>
          </TouchableOpacity>
        </View>

        <View className="mt-5 p-4">
          <Text className="text-lg font-semibold mb-2">Pending Approvals</Text>
          <View className="h-1 bg-black mb-2"></View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-pink">
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <TransparentTopBar
        title="Experts Dashboard"
        onBackPress={handleBackPress}
      />

      <FlatList
        ListHeaderComponent={renderDashboardContent}
        data={pendingApprovals}
        renderItem={({ item }) => (
          <PendingApprovalCard
            description={item.description}
            images={item.images}
            to={item.id}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 10 }}
      />
    </SafeAreaView>
  );
};

// Skeleton Loader Component for loading states
const SkeletonLoader = (handleBackPress) => {
  return (
    <View className="px-3 mt-6 w-full h-full">
      <TransparentTopBar
        title="Experts Dashboard"
        onBackPress={() => {
          router.push("/");
        }}
      />
      <View className="flex-row justify-between mb-4">
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <View className="flex-row justify-between mb-4">
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <View className="bg-gray-200 h-40 rounded-xl mt-5 mb-5"></View>
      <View className="bg-gray-200 h-20 rounded-xl mb-5"></View>
    </View>
  );
};

// Skeleton Card Component
const SkeletonCard = () => (
  <View className="bg-gray-200 p-5 rounded-xl w-[47%] h-24" />
);

// Summary Card Component
const SummaryCard = ({ title, value, color }) => (
  <View className={`p-5 rounded-xl w-[47%] items-center shadow-sm ${color}`}>
    <Text className="text-lg font-semibold">{value}</Text>
    <Text className="text-base text-gray-600 mt-2">{title}</Text>
  </View>
);

// Pending Approval Card Component with image and button
const PendingApprovalCard = ({ description, images, to }) => {
  // Limit the description to 100 characters
  const truncatedDescription =
    description && description.length > 100
      ? `${description.substring(0, 100)}...`
      : description || "No description provided";

  const imageId = images?.[0]?._id || null;

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

      {/* Description with blurred background at the top */}
      <View className="absolute top-0 left-0 w-full p-4 bg-black/30 backdrop-blur-md">
        <Text className="text-white text-xs font-medium leading-5">
          {truncatedDescription}
        </Text>
      </View>

      {/* Centered Floating Glassmorphism Approve button */}
      {to && (
        <View
          className="absolute bottom-4 left-0 right-0 mx-auto w-full items-center"
          style={{
            alignItems: 'center', // Centers the button horizontally
          }}
        >
          <TouchableOpacity
            className="bg-red-400/60 py-2 w-28 rounded-full shadow-lg backdrop-blur-md"
            onPress={() => {

              if (!to) {
                Alert.alert('No id found');
              }
              router.replace(`/pending-requests/${to}`);
            }}
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Text className="text-white text-center font-bold uppercase">
              Check
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};






export default ExpertDashboard;
