import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { fontSizes } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import FooterNote from "@/components/common/footer-note";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppUsagePolicy() {
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
            <Text style={styles.pageTitle}>App Usage Policy</Text>
          </View>

          {/* CONTENT CARD */}
          <View style={styles.contentCard}>
            <Section
              title="1. Purpose of This Policy"
              content={`This App Usage Policy outlines the proper and responsible use of our ride-booking platform (“Stark”). All users — both riders and drivers — are expected to adhere to these rules to ensure a safe, respectful, and reliable experience for everyone.`}
            />

            <Section
              title="2. Account Responsibility"
              content={`Each user is responsible for maintaining the confidentiality of their account credentials. Your account must be used only by you and not shared with others. Any misuse, impersonation, or unauthorized access will result in account review and possible suspension.`}
            />

            <Section
              title="3. OTP Sharing & Ride Verification"
              content={`To begin a ride, the user must share a one-time password (OTP) with the assigned driver.\nFor your safety, please note:\n• Only share the OTP **with the driver displayed in your app**, after verifying their vehicle number and name.\n• Do not share your ride OTP with anyone else, even if they claim to be from support or the company.\n• Drivers are instructed **never to ask for OTPs before arrival** or without starting the trip in the app.\n• The OTP confirms the correct driver–rider match and prevents unauthorized trips.`}
            />

            <Section
              title="4. Unusual Cancellations & Off-App Deals"
              content={`Users must never cancel a ride at the driver’s request in exchange for an off-app deal or lower price.\nPlease remember:\n• Some drivers may ask you to cancel the ride in the app and offer a cheaper price — **this is not allowed**.\n• Canceling in such cases means the trip is no longer tracked or insured by the platform, putting your safety and payment security at risk.\n• Always complete your trip through the official Stark App to ensure support, tracking, and safety coverage.\n• Repeated unusual cancellations (especially after driver arrival) may result in account review and possible suspension.`}
            />

            <Section
              title="5. Prohibited Activities"
              content={`Users are strictly prohibited from:\n• Sharing false information or fraudulent ride requests.\n• Using the platform for unlawful or harmful purposes.\n• Attempting to manipulate pricing or referral systems.\n• Interfering with or modifying the App’s functionality.\n• Harassing, threatening, or abusing drivers or support agents.`}
            />

            <Section
              title="6. Fair Usage"
              content={`Our platform is designed for personal and lawful transportation use. Excessive or abnormal usage that affects platform operations (such as mass cancellations or repeated no-shows) may result in temporary suspension or permanent account deactivation.`}
            />

            <Section
              title="7. Device & Network Requirements"
              content={`To ensure optimal performance, users should:\n• Use updated versions of the App.\n• Maintain stable network connectivity and enable necessary permissions.\n• Avoid using rooted or jailbroken devices for security reasons.`}
            />

            <Section
              title="8. Reporting Misuse"
              content={`If you suspect any misuse, unauthorized ride, or OTP-related fraud, please contact our support team immediately through the “Help & Support” section.`}
            />

            <Section
              title="9. Policy Violations"
              content={`Violation of this policy may lead to restricted access, suspension, or permanent account termination. In severe cases, we may cooperate with law enforcement authorities for investigation.`}
            />

            <Section
              title="10. Policy Updates"
              content={`This policy may be updated periodically to reflect new safety and operational guidelines. Continued use of the App after such updates indicates acceptance of the revised policy.`}
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
    {/* primaryText used for title */}
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