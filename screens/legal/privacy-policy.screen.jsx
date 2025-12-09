import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { fontSizes } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import FooterNote from "@/components/common/footer-note";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicy() {
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
            <Text style={styles.pageTitle}>Privacy Policy</Text>
          </View>

          {/* CONTENT CARD */}
          <View style={styles.contentCard}>
            <Section
              title="1. Introduction"
              content={`This Privacy Policy explains how we collect, use, and protect your personal information when you use our ride-booking services (“Stark”). We are committed to safeguarding your privacy and ensuring that your personal data is handled responsibly.`}
            />

            <Section
              title="2. Information We Collect"
              content={`We collect information necessary to provide our services effectively, including:\n• Personal details such as name, phone number, and email address.\n• Location data for pick-up, navigation, and drop-off purposes.\n• Ride history, payment information, and feedback.\n• Device and usage information, such as app version and operating system.`}
            />

            <Section
              title="3. How We Use Your Information"
              content={`Your data is used for the following purposes:\n• To facilitate ride bookings and driver assignments.\n• To improve safety and customer experience.\n• To process payments and provide receipts.\n• To send service updates, notifications, and promotional content (where applicable).\n• To comply with legal obligations and assist law enforcement if required.`}
            />

            <Section
              title="4. Location Data Usage"
              content={`We use your location data to provide accurate pickup and drop-off experiences, estimate ride times, and match you with nearby drivers. Location data may also be used for safety and analytics. You can manage location permissions through your device settings.`}
            />

            <Section
              title="5. Data Sharing & Third Parties"
              content={`We may share limited data with:\n• Drivers, to enable ride fulfillment.\n• Payment partners, to process transactions.\n• Service providers who help us operate and improve the App.\nWe do not sell or rent your personal data to any third party.`}
            />

            <Section
              title="6. Data Retention"
              content={`Your data is retained only as long as necessary for operational, legal, or security purposes. Once it is no longer required, it will be securely deleted or anonymized.`}
            />

            <Section
              title="7. Data Security"
              content={`We implement strong encryption, secure servers, and regular audits to protect your personal information. However, no digital platform can guarantee 100% security. Users are encouraged to safeguard their account credentials at all times.`}
            />

            <Section
              title="8. User Rights"
              content={`You have the right to:\n• Access your personal information.\n• Request correction or deletion of your data.\n• Withdraw consent for data processing.\nTo exercise these rights, please contact our support team.`}
            />

            <Section
              title="9. Cookies & Analytics"
              content={`The App may use cookies or analytics tools to improve functionality and user experience. You can disable cookies through your device settings, but certain features may not function correctly.`}
            />

            <Section
              title="10. Policy Updates"
              content={`We may update this Privacy Policy periodically. Changes will be communicated through in-app notifications or email. Continued use of the App after changes indicates acceptance of the revised policy.`}
            />

            <Section
              title="11. Contact Information"
              content={`If you have questions or concerns about this Privacy Policy or data handling, please contact us at:\n“Help & Support” section in the App.`}
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