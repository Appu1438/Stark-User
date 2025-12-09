import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { fontSizes } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import FooterNote from "@/components/common/footer-note";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsConditions() {
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
            <Text style={styles.pageTitle}>Terms & Conditions</Text>
          </View>

          {/* CONTENT CARD */}
          <View style={styles.contentCard}>
            <Section
              title="1. Introduction"
              content={`Welcome to our ride-booking platform (“Stark”). By accessing or using our services, you agree to comply with these Terms & Conditions. These terms constitute a legally binding agreement between you and the Company.`}
            />

            <Section
              title="2. User Eligibility"
              content={`By registering and using our platform, you confirm that the information you provide is genuine, accurate, and up to date. Each user is responsible for maintaining the confidentiality of their account details and ensuring that their account is used only for lawful and intended purposes.`}
            />

            <Section
              title="3. Use of the Service"
              content={`The App connects riders with nearby drivers for transportation services. The Company acts solely as a platform facilitator and does not directly provide transportation services. Drivers are independent contractors responsible for complying with local traffic and safety laws.`}
            />

            <Section
              title="4. Booking & Cancellation"
              content={`You can request rides via the App by providing pickup and drop-off details. Once a booking is confirmed, cancellation policies apply. Frequent cancellations or misuse may lead to temporary or permanent suspension of your account.`}
            />

            <Section
              title="5. Payments"
              content={`All ride payments must be made through the App using available payment options. Prices are determined based on distance, time, and dynamic factors like demand. Any surge pricing or additional fees will be clearly displayed before confirming the ride.`}
            />

            <Section
              title="6. User Responsibilities"
              content={`Users must:\n• Treat drivers with respect and maintain proper conduct.\n• Avoid damage to vehicles or misusing the service.\n• Not use the platform for unlawful activities.\nFailure to follow these may lead to account suspension or permanent deactivation.`}
            />

            <Section
              title="7. Safety & Conduct"
              content={`Your safety is our top priority. Drivers undergo verification and training as per company standards. Users are encouraged to share ride details with trusted contacts via in-app features. Any unsafe or inappropriate behavior should be reported immediately through the support section of the App.`}
            />

            <Section
              title="8. Ratings & Feedback"
              content={`After each ride, users and drivers can rate each other. Ratings help maintain quality standards. Any misuse of the rating system or false feedback may result in account review.`}
            />

            <Section
              title="9. Privacy & Data Protection"
              content={`We value your privacy. Personal data such as name, phone number, and location are collected only to improve service quality. Data is stored securely and not shared with third parties except where legally required or essential for operations. For details, please review our Privacy Policy.`}
            />

            <Section
              title="10. Limitation of Liability"
              content={`While we strive to provide safe and reliable rides, the Company is not liable for delays, losses, accidents, or damages arising from driver behavior, traffic conditions, or other external factors. The Company’s liability is limited to the maximum extent permitted by applicable law.`}
            />

            <Section
              title="11. Suspension & Termination"
              content={`We reserve the right to suspend or terminate accounts found violating these terms or engaging in fraudulent or abusive behavior. Users may request account deletion at any time through the App’s settings or by contacting support.`}
            />

            <Section
              title="12. Amendments"
              content={`The Company may update these Terms & Conditions periodically. Continued use of the App after updates constitutes your acceptance of the revised terms.`}
            />

            <Section
              title="13. Contact Information"
              content={`For questions, feedback, or complaints, please reach out to our support team at:\n“Help & Support” section in the App.`}
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