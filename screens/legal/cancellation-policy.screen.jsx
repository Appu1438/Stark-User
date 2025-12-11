import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { fontSizes } from "@/themes/app.constant";
import color from "@/themes/app.colors";
import FooterNote from "@/components/common/footer-note";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CancellationPolicy() {
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
            <Text style={styles.pageTitle}>Cancellation Policy</Text>
          </View>

          {/* CONTENT CARD */}
          <View style={styles.contentCard}>
            <Section
              title="1. Overview"
              content={`This Cancellation Policy applies to riders using the Stark App. It outlines how cancellations and refunds are handled to maintain fairness between riders and drivers while ensuring transparent operations.`}
            />

            <Section
              title="2. Free Cancellation Policy"
              content={`Riders may cancel a booking without any fee under the following circumstances:\n• If the driver has not yet accepted your ride request.\n• If the driver has accepted the request but has not yet started traveling toward your pickup location.`}
            />

            <Section
              title="3. Cancellation After Driver Dispatch"
              content={`If you cancel a ride after the driver has started traveling toward your pickup point, a nominal cancellation charge may apply to compensate for the driver’s time and fuel.\nThe charge typically ranges between ₹100 and ₹200, depending on the estimated distance and time.\nIf you had prepaid, the remaining balance after deduction will be credited back to your wallet immediately.`}
            />

            <Section
              title="4. Cancellation After Driver Arrival"
              content={`If the driver has already arrived at your pickup location and you cancel the ride, a cancellation fee (₹100–₹200) will be applied. The remaining ride amount, if any, will be refunded to your in-app wallet automatically.`}
            />

            <Section
              title="5. Cancellation During an Ongoing Ride"
              content={`If you cancel an ongoing ride, you will be charged for the distance already traveled before cancellation. The system automatically calculates this amount based on GPS data.\nThe remaining balance (if applicable) will be instantly credited to your wallet after deduction.`}
            />

            <Section
              title="6. Disputes & Review"
              content={`If you believe a cancellation fee was applied incorrectly, you can submit a complaint through the “Register Complaint” section in the App.\nOur support team will review your case and provide a resolution within 48 hours.`}
            />

            <Section
              title="7. Exceptional Circumstances"
              content={`In special cases such as:\n• Driver arriving extremely late,\n• Incorrect pickup or route,\n• App or network malfunction —\nthe cancellation fee may be waived or refunded in full after review by our support team.`}
            />

            <Section
              title="8. Updates to Policy"
              content={`This policy may be updated periodically to align with operational or regulatory changes.\nUsers will be notified of major updates through in-app alerts or email communication.`}
            />

            <Section
              title="9. Contact Information"
              content={`For any refund-related queries or clarification, please reach out via the “Help & Support” section in the App.`}
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