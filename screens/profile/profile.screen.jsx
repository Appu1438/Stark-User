import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import Button from "@/components/common/button";
import { useGetUserData } from "@/hooks/useGetUserData";
import { logout } from "@/api/apis";
import color from "@/themes/app.colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import ProfileSkeleton from "./profile-skelton.screen";
import AppAlert from "@/components/modal/alert-modal/alert.modal";


export default function Profile() {
  const { user, loading, refetchData } = useGetUserData();

  const [refreshing, setRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAlert, setShowAlert] = useState(false);


  const onRefresh = async () => {
    setRefreshing(true);
    await refetchData();
    setRefreshing(false);
  };
  if (loading || !user) {
    return <ProfileSkeleton />;
  }
  const mockRating = user.ratings || 0;
  const membership = user.totalRides > 50 ? "Gold Member" : "Basic Member";

  // const handleLogout = async () => {
  //   Alert.alert(
  //     "Confirm Logout",
  //     "Are you sure you want to log out?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Log Out",
  //         style: "destructive",
  //         onPress: async () => await logout(setIsLoggingOut),
  //       },
  //     ],
  //     { cancelable: true }
  //   );
  // };

  const handleLogout = () => {
    setShowAlert(true);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
      }}

      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={color.primary} />
      }
    >
      {/* ---------- HEADER ---------- */}
      <LinearGradient
        colors={[color.subPrimary, color.darkHeader]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: windowHeight(270),
          justifyContent: "center",
          alignItems: "center",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          paddingBottom: 20,
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 8,
        }}
      >
        <View
          style={{
            width: 115,
            height: 115,
            borderRadius: 60,
            backgroundColor: "#fff",
            overflow: "hidden",
            borderWidth: 3,
            borderColor: "#fff",
            marginBottom: 12,
          }}
        >
          <Image
            source={{
              uri:
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </View>
        <Text
          style={{
            fontSize: fontSizes.FONT26,
            fontFamily: "TT-Octosquares-Medium",
            color: "white",
          }}
        >
          {user.name}
        </Text>
        <Text
          style={{
            fontSize: fontSizes.FONT16,
            fontFamily: "TT-Octosquares-Medium",
            color: "#dcdcdc",
            marginTop: 4,
          }}
        >
          {membership}
        </Text>
      </LinearGradient>

      {/* ---------- QUICK STATS ---------- */}
      <LinearGradient
        colors={[color.bgDark, color.bgDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          marginHorizontal: windowWidth(20),
          paddingVertical: windowHeight(18),
          borderRadius: 20,
          marginTop: windowHeight(-50),
        }}
      >
        <StatCard icon="star-outline" label="Rating" value={mockRating.toFixed(1)} />
        <View style={{ width: 1, height: 40, backgroundColor: color.border }} />
        <StatCard
          icon="calendar-outline"
          label="Joined"
          value={new Date(user.createdAt).getFullYear()}
        />
      </LinearGradient>

      {/* ---------- ACCOUNT INFO ---------- */}
      <ProfileSection title="Account Details">
        <InfoRow icon="person-outline" label="Full Name" value={user.name || "-"} />
        <InfoRow icon="mail-outline" label="Email" value={user.email || "-"} />
        <InfoRow icon="call-outline" label="Phone" value={user.phone_number || "-"} showDivider={false} />
      </ProfileSection>

      {/* ---------- SHORTCUTS ---------- */}
      <ProfileSection title="Your Shortcuts">
        <MenuItem
          icon="heart-outline"
          label="Saved Places"
          onPress={() => router.push("/(routes)/profile/saved-places")}
        />
      </ProfileSection>

      {/* ---------- SUPPORT SECTION ---------- */}
      <ProfileSection title="Support & Help">
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => router.push("/(routes)/profile/help-support")}
        />
        <MenuItem
          icon="alert-circle-outline"
          label="Register Complaint"
          onPress={() => router.push("/(routes)/profile/complaints")}
        />
      </ProfileSection>

      {/* ---------- LEGAL SECTION ---------- */}
      <ProfileSection title="App Information">
        <MenuItem
          icon="document-text-outline"
          label="Legal & Policies"
          onPress={() => router.push("/(routes)/legal")}
        />
      </ProfileSection>

      {/* ---------- LOGOUT ---------- */}
      <ProfileSection title="">
        <Button
          title={isLoggingOut ? <ActivityIndicator color={color.primary} /> : "Log Out"}
          onPress={handleLogout}
          disabled={isLoggingOut} />
      </ProfileSection>

      <View style={{ height: 60 }} />

      <AppAlert
        visible={showAlert}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        cancelText="Cancel"
        confirmText="Log Out"
        onCancel={() => setShowAlert(false)}
        onConfirm={() => {
          setShowAlert(false);
          logout(setIsLoggingOut);
        }}
      />

    </ScrollView>
  );
}

/* ---------- SUB COMPONENTS ---------- */

const StatCard = ({ icon, label, value }) => (
  <View style={{ alignItems: "center" }}>
    <Ionicons name={icon} size={24} color={color.primaryText} />
    <Text
      style={{
        fontSize: fontSizes.FONT18,
        color: color.primaryText,
        fontFamily: "TT-Octosquares-Medium",
        marginTop: 4,
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        fontSize: fontSizes.FONT14,
        color: "#aaa",
        fontFamily: "TT-Octosquares-Medium",
      }}
    >
      {label}
    </Text>
  </View>
);

const InfoRow = ({ icon, label, value, showDivider = true }) => (
  <View style={{ marginBottom: showDivider ? 12 : 0 }}>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={20} color={color.primaryText} style={{ marginRight: 10 }} />
        <Text
          style={{
            fontSize: fontSizes.FONT16,
            color: color.primaryText,
            fontFamily: "TT-Octosquares-Medium",
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{
          fontSize: fontSizes.FONT16,
          color: "#888",
          fontFamily: "TT-Octosquares-Medium",
          maxWidth: "60%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
    {showDivider && (
      <View
        style={{
          height: 1,
          backgroundColor: color.border,
          opacity: 0.4,
        }}
      />
    )}
  </View>
);

const MenuItem = ({ icon, label, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
    }}
    activeOpacity={0.7}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Ionicons name={icon} size={22} color={color.primaryText} style={{ marginRight: 12 }} />
      <Text
        style={{
          fontSize: fontSizes.FONT16,
          color: color.primaryText,
          fontFamily: "TT-Octosquares-Medium",
        }}
      >
        {label}
      </Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={20} color="#999" />
  </TouchableOpacity>
);

const ProfileSection = ({ title, children }) => (
  <View style={{ marginTop: 40, paddingHorizontal: windowWidth(25) }}>
    <Text
      style={{
        fontSize: fontSizes.FONT20,
        color: color.primaryText,
        fontFamily: "TT-Octosquares-Medium",
        marginBottom: 12,
      }}
    >
      {title}
    </Text>
    {children}
  </View>
);
