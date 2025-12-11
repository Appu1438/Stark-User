import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { fontSizes } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import FooterNote from "@/components/common/footer-note";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LocationInfo() {
  return (
    <View style={styles.mainContainer}>
      <LinearGradient 
        colors={[color.bgDark, color.subPrimary]} 
        style={StyleSheet.absoluteFill} 
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Location Information</Text>
          </View>

          {/* CONTENT CARD */}
          <View style={styles.contentCard}>
            <Section
              title="1. Purpose of Location Access"
              content={`Our app uses your device’s location data to provide essential ride-booking features, including matching you with nearby drivers, calculating estimated fares and times, and improving the accuracy of pickups and drop-offs.`}
            />

            <Section
              title="2. When Location is Collected"
              content={`We collect location information in the following situations:\n• When the app is open and in use — to identify your pickup location and route progress.\n• When the app is running in the background (if permitted) — to support ongoing rides and safety features.\n• When a driver is en route — to enable live tracking of the vehicle and accurate estimated arrival times.`}
            />

            <Section
              title="3. How We Use Location Data"
              content={`Location data helps us:\n• Match riders and drivers efficiently.\n• Navigate and display real-time routes.\n• Provide accurate fare calculations.\n• Offer safety features, such as sharing live trip status.\n• Improve overall service performance and analytics.`}
            />

            <Section
              title="4. Sharing of Location Data"
              content={`Your location information is shared only with:\n• The driver assigned to your ride, to locate you for pickup.\n• Our technical service providers (e.g., map APIs) to ensure navigation accuracy.\nWe do not sell, rent, or disclose your location data to unauthorized third parties.`}
            />

            <Section
              title="5. Storage and Security"
              content={`Your location data is transmitted securely using encryption and stored temporarily for operational purposes. After completing a ride, precise coordinates are anonymized or deleted, retaining only general route information for records and analytics.`}
            />

            <Section
              title="6. User Control & Permissions"
              content={`You have full control over location permissions. You can:\n• Enable or disable location access in your device settings.\n• Allow location access only while using the app.\n• Deny access at any time.\nDisabling location access may limit certain features such as ride requests or navigation.`}
            />

            <Section
              title="7. Background Location Use"
              content={`In some cases, we may request permission to access your location in the background. This is used solely for ongoing trips to ensure ride safety, real-time tracking, and uninterrupted navigation even if you minimize the app.`}
            />

            <Section
              title="8. Compliance with App Store & Legal Policies"
              content={`We follow Google Play and Apple App Store guidelines regarding location data usage. Our data practices comply with applicable privacy and data protection laws to ensure transparency and user safety.`}
            />

            <Section
              title="9. Contact Information"
              content={`If you have questions about how we use your location data, contact our privacy team at:\n“Help & Support” section in the App.`}
            />
          </View>

          <FooterNote />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/* ---------- SECTION COMPONENT ---------- */
const Section = ({ title, content }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionContent}>{content}</Text>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: color.bgDark },
  scrollContent: { padding: 20, paddingBottom: 50 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, gap: 15 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize:  fontSizes.FONT20, color: "#fff", fontFamily: "TT-Octosquares-Medium" },

  // Content Card
  contentCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 30,
  },

  // Section Styles
  sectionContainer: { marginBottom: 25 },
  sectionTitle: {
    fontSize:  fontSizes.FONT18,
    fontFamily: "TT-Octosquares-Medium",
    color: color.primaryText,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize:  fontSizes.FONT14,
    lineHeight: 24,
    color: '#ccc',
    fontFamily: "TT-Octosquares-Medium",
    textAlign: 'justify',
    opacity: 0.9,
  },
});