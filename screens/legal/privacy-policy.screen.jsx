import { View, Text, ScrollView } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

export default function PrivacyPolicy() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        paddingHorizontal: windowWidth(20),
        paddingTop: windowHeight(40),
        paddingBottom: windowHeight(50),
      }}
    >
      <Text
        style={{
          fontSize: fontSizes.FONT26,
          fontFamily: "TT-Octosquares-Medium",
          color: color.primaryText,
          marginBottom: 25,
          textAlign: "center",
        }}
      >
        Privacy Policy
      </Text>

      <Section
        title="1. Introduction"
        content={`This Privacy Policy explains how we collect, use, and protect your personal information when you use our ride-booking services (“Stark”). We are committed to safeguarding your privacy and ensuring that your personal data is handled responsibly.`}
      />

      <Section
        title="2. Information We Collect"
        content={`We collect information necessary to provide our services effectively, including:
• Personal details such as name, phone number, and email address.
• Location data for pick-up, navigation, and drop-off purposes.
• Ride history, payment information, and feedback.
• Device and usage information, such as app version and operating system.`}
      />

      <Section
        title="3. How We Use Your Information"
        content={`Your data is used for the following purposes:
• To facilitate ride bookings and driver assignments.
• To improve safety and customer experience.
• To process payments and provide receipts.
• To send service updates, notifications, and promotional content (where applicable).
• To comply with legal obligations and assist law enforcement if required.`}
      />

      <Section
        title="4. Location Data Usage"
        content={`We use your location data to provide accurate pickup and drop-off experiences, estimate ride times, and match you with nearby drivers. Location data may also be used for safety and analytics. You can manage location permissions through your device settings.`}
      />

      <Section
        title="5. Data Sharing & Third Parties"
        content={`We may share limited data with:
• Drivers, to enable ride fulfillment.
• Payment partners, to process transactions.
• Service providers who help us operate and improve the App.
We do not sell or rent your personal data to any third party.`}
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
        content={`You have the right to:
• Access your personal information.
• Request correction or deletion of your data.
• Withdraw consent for data processing.
To exercise these rights, please contact our support team.`}
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
        content={`If you have questions or concerns about this Privacy Policy or data handling, please contact us at:
“Help & Support” section in the App.`}
      />

      <Text
        style={{
          fontSize: fontSizes.FONT14,
          color: "#999",
          textAlign: "center",
          marginTop: 20,
          fontFamily: "TT-Octosquares-Medium",
          marginBottom: 25,
        }}
      >
        © {new Date().getFullYear()} Stark OPC Pvt. Ltd. All rights reserved.
      </Text>
    </ScrollView>
  );
}

/* ---------- SECTION COMPONENT ---------- */
const Section = ({ title, content }) => (
  <View style={{ marginBottom: 25 }}>
    <Text
      style={{
        fontSize: fontSizes.FONT18,
        fontFamily: "TT-Octosquares-Medium",
        color: color.primaryText,
        marginBottom: 6,
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        fontSize: fontSizes.FONT15,
        lineHeight: 24,
        color: color.primaryText,
        fontFamily: "TT-Octosquares-Medium",
        opacity: 0.9,
      }}
    >
      {content}
    </Text>
  </View>
);
