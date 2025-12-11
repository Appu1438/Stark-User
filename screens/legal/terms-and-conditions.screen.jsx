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
              content={`By registering and using our platform, you confirm that the information you provide is genuine, accurate, and up to date. Users are responsible for maintaining the confidentiality of their account and ensuring the platform is used only for lawful and intended purposes.`}
            />

            <Section
              title="3. Use of the Service"
              content={`The App connects riders with nearby drivers for transportation services. The Company acts solely as a facilitator and does not directly provide transportation. Drivers are independent contractors responsible for complying with all legal, traffic, and safety requirements.`}
            />

            <Section
              title="4. Booking & Cancellation"
              content={`Users can request rides via the App by providing pickup and drop-off details. Once a ride is confirmed, cancellation policies apply. Frequent cancellations, misuse, or fraudulent booking activity may lead to account restrictions or suspension.`}
            />

            <Section
              title="5. Payments"
              content={`Ride fares are calculated based on distance, time, demand, and other operational factors. All applicable charges will be displayed before confirming the ride. Users are required to pay the full fare using available payment options inside the App.`}
            />

            {/* ✅ NEW SECTION: Charges Explanation */}
            <Section
              title="6. Additional Charges (Tolls, Parking & Waiting Time)"
              content={`• Tolls, parking fees, interstate permits, and government-imposed charges are not included in the estimated fare shown in the App.\n• These charges are applicable as per actuals and must be paid by the user directly to the driver.\n• For round trips or situations where the driver must wait at the pickup or destination, waiting charges may apply.\n• Any waiting fee is calculated based on the total waiting duration and may vary depending on ride type and location.\n• These charges will be clearly communicated by the driver when applicable and must be settled at the end of the trip.`}
            />

            <Section
              title="7. User Responsibilities"
              content={`Users must:\n• Treat drivers respectfully and maintain courteous behavior.\n• Avoid damaging the vehicle or causing disturbances.\n• Not use the platform for unlawful or harmful activities.\nNon-compliance may lead to temporary or permanent account suspension.`}
            />

            <Section
              title="8. Safety & Conduct"
              content={`Your safety is our priority. Drivers undergo verification as per company standards. Users are encouraged to share ride details with trusted contacts. Any unsafe or inappropriate behavior should be reported immediately via the in-app support system.`}
            />

            <Section
              title="9. Ratings & Feedback"
              content={`After each ride, users and drivers can rate each other. Ratings help maintain service quality. Providing false, harmful, or misleading feedback may result in account review or restrictions.`}
            />

            <Section
              title="10. Privacy & Data Protection"
              content={`We collect and store only essential personal information required for delivering the service. Your data will not be shared with third parties except as legally required or necessary for platform operations. Refer to our Privacy Policy for more details.`}
            />

            <Section
              title="11. Limitation of Liability"
              content={`While we strive to ensure safe and reliable rides, the Company is not liable for delays, damages, losses, or incidents arising from driver actions, traffic conditions, accidents, or unforeseen circumstances.`}
            />

            <Section
              title="12. Suspension & Termination"
              content={`We may suspend or terminate accounts violating these terms, engaging in fraudulent activity, or misusing the platform. Users may request account deletion through the App settings or by contacting support.`}
            />

            <Section
              title="13. Amendments"
              content={`The Company may update these Terms & Conditions periodically. Continued use of the App constitutes acceptance of the latest version.`}
            />

            <Section
              title="14. Contact Information"
              content={`For questions, feedback, or complaints, please reach out via the “Help & Support” section within the App.`}
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
  pageTitle: { fontSize: fontSizes.FONT20, color: "#fff", fontFamily: "TT-Octosquares-Medium" },

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
    fontSize: fontSizes.FONT18,
    fontFamily: "TT-Octosquares-Medium",
    color: color.primaryText,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: fontSizes.FONT14,
    lineHeight: 24,
    color: '#ccc',
    fontFamily: "TT-Octosquares-Medium",
    textAlign: 'justify',
    opacity: 0.9,
  },
});

