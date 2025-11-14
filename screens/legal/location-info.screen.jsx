import { View, Text, ScrollView } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

export default function LocationInfo() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: color.background,
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
        Location Information
      </Text>

      <Section
        title="1. Purpose of Location Access"
        content={`Our app uses your device’s location data to provide essential ride-booking features, including matching you with nearby drivers, calculating estimated fares and times, and improving the accuracy of pickups and drop-offs.`}
      />

      <Section
        title="2. When Location is Collected"
        content={`We collect location information in the following situations:
• When the app is open and in use — to identify your pickup location and route progress.
• When the app is running in the background (if permitted) — to support ongoing rides and safety features.
• When a driver is en route — to enable live tracking of the vehicle and accurate estimated arrival times.`}
      />

      <Section
        title="3. How We Use Location Data"
        content={`Location data helps us:
• Match riders and drivers efficiently.
• Navigate and display real-time routes.
• Provide accurate fare calculations.
• Offer safety features, such as sharing live trip status.
• Improve overall service performance and analytics.`}
      />

      <Section
        title="4. Sharing of Location Data"
        content={`Your location information is shared only with:
• The driver assigned to your ride, to locate you for pickup.
• Our technical service providers (e.g., map APIs) to ensure navigation accuracy.
We do not sell, rent, or disclose your location data to unauthorized third parties.`}
      />

      <Section
        title="5. Storage and Security"
        content={`Your location data is transmitted securely using encryption and stored temporarily for operational purposes. After completing a ride, precise coordinates are anonymized or deleted, retaining only general route information for records and analytics.`}
      />

      <Section
        title="6. User Control & Permissions"
        content={`You have full control over location permissions. You can:
• Enable or disable location access in your device settings.
• Allow location access only while using the app.
• Deny access at any time.
Disabling location access may limit certain features such as ride requests or navigation.`}
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
        content={`If you have questions about how we use your location data, contact our privacy team at:
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
