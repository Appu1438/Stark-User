import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import Button from "@/components/common/button";
import { LinearGradient } from "expo-linear-gradient";
import { useGetUserRideHistories } from "@/hooks/useGetUserData";
import axiosInstance from "@/api/axiosInstance";
import ComplaintSkeleton from "./complaints-skelton.screen";

export default function Complaints() {
  const { recentRides } = useGetUserRideHistories();
  const [selectedRide, setSelectedRide] = useState(null);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [rideModalVisible, setRideModalVisible] = useState(false);

  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await axiosInstance.get("/complaints/user");
      if (res?.data?.data) {
        // adjust to your response shape if needed
        setComplaints(res.data.data);
      } else if (res?.data) {
        setComplaints(res.data);
      } else {
        setComplaints([]);
      }
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      Alert.alert("Error", "Could not load complaints. Please try again.");
    } finally {
      setTimeout(() => {
        setLoadingComplaints(false);
      }, 2000);
    }
  };

  if (loadingComplaints) return <ComplaintSkeleton />;


  const handleSubmit = async () => {
    if (!category || !message.trim()) {
      Alert.alert("Missing fields", "Please select a category and describe your issue.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        category,
        message: message.trim(),
      };
      if (selectedRide && (selectedRide._id || selectedRide.id)) {
        payload.rideId = selectedRide._id || selectedRide.id;
      }

      const res = await axiosInstance.post("/complaints/user", payload);

      // Expect server to return the saved complaint in res.data.data (as earlier pattern)
      const created = res?.data?.data || res?.data || null;

      if (created) {
        // Prepend created complaint to local state
        setComplaints((prev) => [created, ...prev]);
        // reset form
        setSelectedRide(null);
        setCategory("");
        setMessage("");
        setRideModalVisible(false);
        Alert.alert("Success", "Complaint submitted successfully.");
      } else {
        // fallback optimistic entry (if server returns nothing)
        const fallback = {
          id: Date.now(),
          ride: selectedRide || null,
          category,
          message,
          status: "Pending",
          date: new Date().toISOString().split("T")[0],
        };
        setComplaints((prev) => [fallback, ...prev]);
        setSelectedRide(null);
        setCategory("");
        setMessage("");
        setRideModalVisible(false);
        Alert.alert("Submitted", "Complaint submitted (no server response body).");
      }
    } catch (err) {
      console.error("Submit complaint failed:", err);
      Alert.alert("Error", "Failed to submit complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "#4CAF50";
      case "In Review":
        return "#29B6F6";
      case "Pending":
        return "#FFA726";
      case "Rejected":
        return "#E57373";
      default:
        return "#999";
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: color.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          paddingHorizontal: windowWidth(25),
          paddingTop: windowHeight(40),
          paddingBottom: windowHeight(80),
        }}
      >
        {/* HEADER */}
        <Text
          style={{
            fontSize: fontSizes.FONT26,
            fontFamily: "TT-Octosquares-Medium",
            color: color.primaryText,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Register Complaint
        </Text>

        <Text
          style={{
            fontSize: fontSizes.FONT14,
            fontFamily: "TT-Octosquares-Medium",
            color: color.primaryGray,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Select a ride (optional), describe your issue, and our support team will assist you soon.
        </Text>

        {/* FORM CARD */}
        <LinearGradient
          colors={[color.darkPrimary, color.bgDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 18,
            padding: 18,
            marginBottom: 30,
          }}
        >
          {/* Related Ride (optional) */}
          <Text
            style={{
              color: color.primaryText,
              fontSize: fontSizes.FONT18,
              fontFamily: "TT-Octosquares-Medium",
              marginBottom: 10,
            }}
          >
            Related Ride (optional)
          </Text>

          <TouchableOpacity
            onPress={() => setRideModalVisible(true)}
            activeOpacity={0.85}
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 15,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <Text
              style={{
                color: selectedRide ? color.primaryText : "#777",
                fontFamily: "TT-Octosquares-Medium",
                fontSize: fontSizes.FONT15,
              }}
            >
              {selectedRide
                ? `${selectedRide.destinationLocationName || "Unnamed Ride"} • ₹${selectedRide.totalFare}`
                : "Select a recent ride (optional)"}
            </Text>
            <Ionicons name="chevron-down-outline" size={18} color={color.primaryText} />
          </TouchableOpacity>

          {/* Category chips */}
          <Text
            style={{
              color: color.primaryText,
              fontSize: fontSizes.FONT18,
              fontFamily: "TT-Octosquares-Medium",
              marginBottom: 10,
            }}
          >
            Complaint Type
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
            {["Ride Issue", "Payment Issue", "Driver Behavior", "App Issue", "Other"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: category === item ? color.buttonBg : "rgba(255,255,255,0.06)",
                  marginRight: 10,
                  borderWidth: 1,
                  borderColor: category === item ? color.primary : "rgba(255,255,255,0.08)",
                }}
                activeOpacity={0.85}
              >
                <Text
                  style={{
                    color: category === item ? color.primary : color.primaryText,
                    fontFamily: "TT-Octosquares-Medium",
                    fontSize: fontSizes.FONT14,
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Message */}
          <Text
            style={{
              color: color.primaryText,
              fontSize: fontSizes.FONT18,
              fontFamily: "TT-Octosquares-Medium",
              marginBottom: 10,
            }}
          >
            Describe Your Issue
          </Text>

          <TextInput
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              padding: 12,
              fontSize: fontSizes.FONT16,
              color: color.primaryText,
              minHeight: 110,
              textAlignVertical: "top",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              fontFamily: "TT-Octosquares-Medium",
            }}
            placeholder="Type your message here..."
            placeholderTextColor="#999"
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <View style={{ marginTop: 18 }}>
            <Button
              title={submitting ? "Submitting..." : "Submit Complaint"}
              onPress={handleSubmit}
              disabled={submitting}
            />
          </View>
        </LinearGradient>

        {/* Complaints header */}
        <Text
          style={{
            fontSize: fontSizes.FONT22,
            fontFamily: "TT-Octosquares-Medium",
            color: color.primaryText,
            marginBottom: 12,
          }}
        >
          Your Complaints
        </Text>

        {/* Loading indicator */}
        {loadingComplaints ? (
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <ActivityIndicator size="small" color={color.primary} />
          </View>
        ) : complaints.length === 0 ? (
          <Text
            style={{
              fontSize: fontSizes.FONT16,
              color: "#aaa",
              fontFamily: "TT-Octosquares-Medium",
              textAlign: "center",
              marginTop: 24,
            }}
          >
            No complaints registered yet.
          </Text>
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => (item._id || item.id || `${item.date}-${item.category}`)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: color.subPrimary,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 14,
                  borderLeftWidth: 4,
                  borderLeftColor: getStatusColor(item.status),
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: fontSizes.FONT16,
                      fontFamily: "TT-Octosquares-Medium",
                      color: color.primaryText,
                    }}
                  >
                    {item.category}
                  </Text>
                  <Text style={{ color: getStatusColor(item.status), fontFamily: "TT-Octosquares-Medium", fontSize: fontSizes.FONT13 }}>
                    {item.status || "Pending"}
                  </Text>
                </View>

                {item.ride && (
                  <Text
                    style={{
                      color: "#999",
                      fontSize: fontSizes.FONT13,
                      marginTop: 6,
                      fontFamily: "TT-Octosquares-Medium",
                    }}
                  >
                    Ride: {item.ride.destinationLocationName || "Unknown"} • ₹{item.ride.totalFare || "-"}
                  </Text>
                )}

                <Text
                  style={{
                    color: "#aaa",
                    fontSize: fontSizes.FONT14,
                    marginVertical: 8,
                    fontFamily: "TT-Octosquares-Medium",
                  }}
                  numberOfLines={2}
                >
                  {item.message}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="time-outline" size={14} color="#999" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#999", fontSize: fontSizes.FONT13, fontFamily: "TT-Octosquares-Medium" }}>
                    {new Date(item.createdAt || item.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>

      {/* RIDE SELECTION MODAL */}
      <Modal visible={rideModalVisible} transparent animationType="fade" onRequestClose={() => setRideModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <View style={{ backgroundColor: color.subPrimary, width: "100%", borderRadius: 14, padding: 14, maxHeight: "72%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: fontSizes.FONT18, fontFamily: "TT-Octosquares-Medium", color: color.primaryText }}>Select Your Ride</Text>
              <TouchableOpacity onPress={() => { setSelectedRide(null); setRideModalVisible(false); }}>
                <Text style={{ color: color.primaryText, fontFamily: "TT-Octosquares-Medium" }}>Clear</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {recentRides && recentRides.length > 0 ? (
                recentRides.map((ride) => (
                  <TouchableOpacity
                    key={ride._id}
                    onPress={() => {
                      setSelectedRide(ride);
                      setRideModalVisible(false);
                    }}
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <Text style={{ color: color.primaryText, fontFamily: "TT-Octosquares-Medium", fontSize: fontSizes.FONT15 }}>
                      {ride.destinationLocationName || "Unnamed Ride"}
                    </Text>
                    <Text style={{ color: "#aaa", fontSize: fontSizes.FONT13, marginTop: 4, fontFamily: "TT-Octosquares-Medium" }}>
                      ₹{ride.totalFare} • {new Date(ride.createdAt).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: "#aaa", textAlign: "center", marginVertical: 20, fontFamily: "TT-Octosquares-Medium" }}>
                  No recent rides found.
                </Text>
              )}
            </ScrollView>

            <View style={{ marginTop: 12 }}>
              <Button title="Close" onPress={() => setRideModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
