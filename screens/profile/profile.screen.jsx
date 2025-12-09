import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useGetUserData } from "@/hooks/useGetUserData";
import { logout } from "@/api/apis";
import color from "@/themes/app.colors";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import ProfileSkeleton from "./profile-skelton.screen";
import AppAlert from "@/components/modal/alert-modal/alert.modal";
import FooterNote from "@/components/common/footer-note";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";

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
  const totalRides = user.totalRides || 0;
  const pendingRides = user.pendingRides || 0;
  const cancelRides = user.cancelRides || 0;
  const membership = user.totalRides > 50 ? "Gold Member" : "Basic Member";

  const handleLogout = () => {
    setShowAlert(true);
  };

  // --- REUSABLE MENU ITEM ---
  const SectionLink = ({ title, path, icon, isLast }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(path)}
      style={[styles.menuItem, isLast && styles.menuItemLast]}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.menuText}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* BACKGROUND GRADIENT */}
      <LinearGradient
        colors={[color.bgDark, color.subPrimary]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={color.primary}
            progressViewOffset={40}
          />
        }
      >
        {/* ---------- HEADER PROFILE ---------- */}
        <View style={styles.headerContainer}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                }}
                style={styles.avatarImage}
              />
              <View style={styles.activeBadge} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.tagRow}>
                <View style={styles.proTag}>
                  <Text style={styles.proTagText}>{membership.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* QUICK STATS ROW */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconBox}>
                <Ionicons name="star" size={14} color="#FFD700" />
              </View>
              <Text style={styles.statValue}>{mockRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                <Ionicons name="calendar" size={14} color="#fff" />
              </View>
              <Text style={styles.statValue}>{new Date(user.createdAt).getFullYear()}</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
          <View style={styles.activityContainer}>

            {/* 1. Total / Completed */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: 'rgba(0, 230, 118, 0.1)' }]}>
                <Ionicons name="checkmark-circle" size={16} color="#00E676" />
              </View>
              <Text style={styles.activityValue}>{totalRides}</Text>
              <Text style={styles.activityLabel}>Completed</Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.activityDivider} />

            {/* 2. Pending */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: 'rgba(255, 171, 0, 0.1)' }]}>
                <Ionicons name="time" size={16} color="#FFAB00" />
              </View>
              <Text style={styles.activityValue}>{pendingRides}</Text>
              <Text style={styles.activityLabel}>Pending</Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.activityDivider} />

            {/* 3. Cancelled */}
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: 'rgba(255, 82, 82, 0.1)' }]}>
                <Ionicons name="close-circle" size={16} color="#FF5252" />
              </View>
              <Text style={styles.activityValue}>{cancelRides}</Text>
              <Text style={styles.activityLabel}>Cancelled</Text>
            </View>
          </View>
        </View>

        {/* ---------- MENU SECTIONS ---------- */}

        {/* GROUP 1: ACCOUNT */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
        </View>
        <View style={styles.menuContainer}>
          <SectionLink
            title="Saved Places"
            path="/(routes)/profile/saved-places"
            icon={<Ionicons name="heart" size={18} color="#FF5252" />}
            isLast
          />
        </View>

        {/* GROUP 2: SUPPORT & HELP */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support</Text>
        </View>
        <View style={styles.menuContainer}>
          <SectionLink
            title="Help & Support"
            path="/(routes)/profile/help-support"
            icon={<Feather name="headphones" size={18} color="#00B0FF" />}
          />
          <SectionLink
            title="Report an Issue"
            path="/(routes)/profile/complaints"
            icon={<MaterialIcons name="report-problem" size={18} color="#FFAB00" />}
            isLast
          />
        </View>

        {/* GROUP 3: LEGAL */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Legal</Text>
        </View>
        <View style={styles.menuContainer}>
          <SectionLink
            title="Terms & Policies"
            path="/(routes)/legal"
            icon={<Ionicons name="document-text" size={18} color="#9E9E9E" />}
            isLast
          />
        </View>

        {/* ---------- LOGOUT ---------- */}
        <TouchableOpacity
          disabled={isLoggingOut}
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#FF3B30" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FF3B30" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Log Out</Text>
            </>
          )}
        </TouchableOpacity>

        <FooterNote />

        <Text style={styles.versionText}>
          v{Constants.expoConfig?.version} • {Constants.expoConfig?.name || "Stark Driver App"}
        </Text>

      </ScrollView>

      <AppAlert
        visible={showAlert}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Log Out"
        cancelText="Cancel"
        showCancel={true}
        onCancel={() => setShowAlert(false)}
        onConfirm={async () => {
          setShowAlert(false);
          await logout(setIsLoggingOut);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },

  versionText: {
    textAlign: 'center',
    color: '#444',
    fontSize: 11,
    marginTop: 20,
    fontFamily: 'TT-Octosquares-Medium',
  },

  // Header
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatarImage: {
    width: 75,
    height: 75,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    backgroundColor: '#00E676',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#121212',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'TT-Octosquares-Medium',
    letterSpacing: 0.5,
  },
  profileEmail: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'TT-Octosquares-Medium',
    marginTop: 2,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
  },
  proTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  proTagText: {
    fontSize: 10,
    color: '#FFD700',
    fontFamily: 'TT-Octosquares-Medium',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'TT-Octosquares-Medium',
  },
  statLabel: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'TT-Octosquares-Medium',

  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: '80%',
    alignSelf: 'center',
  },

  // ... existing styles

  // --- New Activity Dashboard Styles ---
  activityContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)', // Slightly lighter than background
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 15, // Space between Rating row and this row
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    width: 34,
    height: 34,
    borderRadius: 12, // Squircle shape
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  activityValue: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'TT-Octosquares-Medium',
    lineHeight: 22,
  },
  activityLabel: {
    fontSize: 11,
    color: '#888', // Muted text for labels
    fontFamily: 'TT-Octosquares-Medium',
  },
  activityDivider: {
    width: 1,
    height: '60%', // Don't touch top/bottom edges
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
  },

  // Sections
  sectionHeader: {
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 25,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'TT-Octosquares-Medium',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: '#eee',
    fontSize: 15,
    fontFamily: 'TT-Octosquares-Medium',
  },
  menuItemRight: {
    marginLeft: 10,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontFamily: 'TT-Octosquares-Medium',
  },
});