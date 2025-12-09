import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { fontSizes } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import FooterNote from "@/components/common/footer-note";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SafetyGuidelines() {
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
            <Text style={styles.pageTitle}>Safety Guidelines</Text>
          </View>

          {/* CONTENT CARD */}
          <View style={styles.contentCard}>
            <Section
              title="1. Commitment to Safety"
              content={`Your safety is our top priority. We continuously work to maintain a secure and reliable environment for both riders and drivers. Our platform includes features, policies, and monitoring tools designed to protect everyone throughout the ride experience.`}
            />

            <Section
              title="2. Verified Drivers"
              content={`All drivers undergo identity verification, driving-license checks, and background screening before being approved. Regular evaluations ensure drivers continue to meet our community standards.`}
            />

            <Section
              title="3. Safe Riding Practices"
              content={`• Always verify the vehicle number and driver name before starting your ride.\n• Wear your seatbelt during the entire journey.\n• Avoid sharing personal details with drivers or co-passengers.\n• Do not request the driver to violate traffic or route rules.\n• Keep valuables secured and avoid displaying large amounts of cash.`}
            />

            <Section
              title="4. In-App Safety Features"
              content={`Our app includes multiple tools to enhance your safety:\n• Live ride tracking and share-trip feature.\n• Emergency assistance or SOS button connecting you directly with support or local authorities.\n• Driver and trip rating system to ensure accountability.\n• Real-time GPS monitoring of active rides.`}
            />

            <Section
              title="5. Conduct Expectations"
              content={`We expect all users and drivers to treat each other with mutual respect and courtesy. Any form of verbal or physical harassment, discrimination, or unsafe conduct will lead to investigation and may result in suspension or permanent account deactivation.`}
            />

            <Section
              title="6. Night-Time & Solo Travel Tips"
              content={`• Share your live trip status with trusted contacts.\n• Confirm the route shown in the app before the trip starts.\n• Prefer well-lit pickup and drop-off points.\n• If you feel unsafe at any time, use the emergency button or contact support immediately.`}
            />

            <Section
              title="7. Health & Hygiene"
              content={`Drivers and riders are encouraged to maintain cleanliness and hygiene inside the vehicle. Smoking, alcohol, or any prohibited substance use during rides is strictly forbidden.`}
            />

            <Section
              title="8. Reporting Safety Concerns"
              content={`If you experience or witness unsafe behavior, please report it through the “Help & Support” section of the App. All reports are treated seriously and investigated promptly.`}
            />

            <Section
              title="9. Continuous Improvement"
              content={`We regularly review safety data and user feedback to update our policies and introduce new safety measures. Your input helps us make every ride safer and more reliable.`}
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
  pageTitle: { fontSize: 24, color: "#fff", fontFamily: "TT-Octosquares-Medium" },

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
    fontSize: 18,
    fontFamily: "TT-Octosquares-Medium",
    color: color.primaryText,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 24,
    color: '#ccc',
    fontFamily: "TT-Octosquares-Medium",
    textAlign: 'justify',
    opacity: 0.9,
  },
});