import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, LineChart } from 'react-native-chart-kit';
import TransparentTopBar from '../../components/TransparentTopBar';
import { LinearGradient } from 'expo-linear-gradient';
import CustomButton from "../../components/CustomButton";
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur'; 
import { Asset } from 'expo-asset';
const screenWidth = Dimensions.get('window').width;

const AnalysisDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [requestData, setRequestData] = useState({
    approved: 0,
    total: 0,
    expired: 0,
    pending: 0,
  });
  const [timeSeriesData, setTimeSeriesData] = useState({
    approvals: [0],
    rejects: [0],
    deliveries: [0],
  });

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/fsr/get/analytics`);
      if (!response.ok) throw new Error("Failed to fetch analytics data");

      const data = await response.json();
      setRequestData({
        approved: data.approvedCount || 0,
        total: data.totalCount || 0,
        expired: data.expiredCount || 0,
        pending: data.pendingCount || 0,
      });
      setTimeSeriesData({
        approvals: data.approvalsOverTime.length ? data.approvalsOverTime : [0],
        rejects: data.rejectsOverTime.length ? data.rejectsOverTime : [0],
        deliveries: data.deliveriesOverTime.length ? data.deliveriesOverTime : [0],
      });
      setLoading(false);
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.replace("/expert-dashboard");
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const SkeletonLoader = () => (
    <View className="px-3 mt-6 w-full h-full">
      <TransparentTopBar title="Analysis Dashboard" onBackPress={handleBackPress} />
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

  const SkeletonCard = () => (
    <View className="bg-gray-200 p-5 rounded-xl w-[47%] h-24" />
  );

  const ErrorState = () => (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <Text className="text-lg text-red-500">
        Failed to load data. Check your network connection.
      </Text>
      <TouchableOpacity
        onPress={fetchAnalyticsData}
        className="bg-blue-500 p-3 mt-3 rounded"
      >
        <Text className="text-white">Retry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  //downloades a file with the analytics data
  const handleDownload = async () => {
    const dataToExport = {
      requestData,
      timeSeriesData,
    };

    const fileUri = `${FileSystem.documentDirectory}analytics_data.txt`;
    const dataAsString = JSON.stringify(dataToExport, null, 2);

    try {
      await FileSystem.writeAsStringAsync(fileUri, dataAsString);
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Sharing.shareAsync(fileUri);
      } else {
        console.log("File saved at: ", fileUri);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleCert = async () => {
    try {
      // Load the certificate from the assets folder
      const certAsset = Asset.fromModule(require('../../assets/Certification.pdf'));  // <-- Ensure the path to the file is correct
      await certAsset.downloadAsync();
  
      const certUri = certAsset.localUri || certAsset.uri;  // Get the file URI
  
      // Share the certificate
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Sharing.shareAsync(certUri);
      } else {
        console.log("File saved at: ", certUri);
      }
    } catch (error) {
      console.error("Error handling certificate file:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorState />;
  }

  //pre configured data for the pie chart like headers, colors and values
  const pieChartData = [
    { name: 'Approved', count: requestData.approved, color: '#4caf50', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Pending', count: requestData.pending, color: '#2196f3', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Expired', count: requestData.expired, color: '#f44336', legendFontColor: '#7F7F7F', legendFontSize: 15 },
    { name: 'Total', count: requestData.total, color: '#ffeb3b', legendFontColor: '#7F7F7F', legendFontSize: 15 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={['#000000', '#1a1a2e', '#16213e']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <View className="p-1 shadow-sm">
      <BlurView intensity={110} tint="light" className="rounded-b-3xl">
        <View className="flex-row justify-center items-center p-4">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-black flex-1 text-left pl-5">
          Analysis Dashboard
          </Text>

          <TouchableOpacity onPress={handleCert} className="text-center ">
            <Text className="text-sm font-pbold text-green-700">
              Certificate
            </Text>

          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
      <ScrollView className="p-4">
        <View className="mb-5">
          <Text className="text-lg font-semibold text-center mb-2">Request Analysis</Text>
          <PieChart
            data={pieChartData}
            width={screenWidth}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              strokeWidth: 2,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
          />
        </View>

        <View className="mb-5">
          <Text className="text-lg font-semibold text-center mb-2">Approvals vs Rejects Over Time</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
              datasets: [
                {
                  data: timeSeriesData.approvals,
                  color: (opacity = 1) => `rgba(34, 202, 34, ${opacity})`,
                },
                {
                  data: timeSeriesData.rejects,
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                },
              ],
            }}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View className="mb-5">
          <Text className="text-lg font-semibold text-center mb-2">Delivery Before Expiration Over Time</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
              datasets: [
                {
                  data: timeSeriesData.deliveries,
                  color: (opacity = 1) => `rgba(0, 128, 255, ${opacity})`,
                },
              ],
            }}
            width={screenWidth - 20}
            height={220}
            chartConfig={{
              backgroundColor: '#022173',
              backgroundGradientFrom: '#1E2923',
              backgroundGradientTo: '#08130D',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <CustomButton
          title="Download"
          handlePress={handleDownload}
          containerStyles="w-full mb-5"
          textStyles="text-lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalysisDashboard;
