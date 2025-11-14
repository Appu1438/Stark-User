import { View, Text, ScrollView } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

export default function AppUsagePolicy() {
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
        App Usage Policy
      </Text>

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
        content={`To begin a ride, the user must share a one-time password (OTP) with the assigned driver. 
For your safety, please note:
• Only share the OTP **with the driver displayed in your app**, after verifying their vehicle number and name.  
• Do not share your ride OTP with anyone else, even if they claim to be from support or the company.  
• Drivers are instructed **never to ask for OTPs before arrival** or without starting the trip in the app.  
• The OTP confirms the correct driver–rider match and prevents unauthorized trips.`}
      />

      <Section
        title="4. Unusual Cancellations & Off-App Deals"
        content={`Users must never cancel a ride at the driver’s request in exchange for an off-app deal or lower price.  
Please remember:
• Some drivers may ask you to cancel the ride in the app and offer a cheaper price — **this is not allowed**.  
• Canceling in such cases means the trip is no longer tracked or insured by the platform, putting your safety and payment security at risk.  
• Always complete your trip through the official Stark App to ensure support, tracking, and safety coverage.  
• Repeated unusual cancellations (especially after driver arrival) may result in account review and possible suspension.`}
      />

      <Section
        title="5. Prohibited Activities"
        content={`Users are strictly prohibited from:
• Sharing false information or fraudulent ride requests.
• Using the platform for unlawful or harmful purposes.
• Attempting to manipulate pricing or referral systems.
• Interfering with or modifying the App’s functionality.
• Harassing, threatening, or abusing drivers or support agents.`}
      />

      <Section
        title="6. Fair Usage"
        content={`Our platform is designed for personal and lawful transportation use. Excessive or abnormal usage that affects platform operations (such as mass cancellations or repeated no-shows) may result in temporary suspension or permanent account deactivation.`}
      />

      <Section
        title="7. Device & Network Requirements"
        content={`To ensure optimal performance, users should:
• Use updated versions of the App.
• Maintain stable network connectivity and enable necessary permissions.
• Avoid using rooted or jailbroken devices for security reasons.`}
      />

      <Section
        title="8. Reporting Misuse"
        content={`If you suspect any misuse, unauthorized ride, or OTP-related fraud, please contact our support team immediately through the “Help & Support” section or at support@yourapp.com.`}
      />

      <Section
        title="9. Policy Violations"
        content={`Violation of this policy may lead to restricted access, suspension, or permanent account termination. In severe cases, we may cooperate with law enforcement authorities for investigation.`}
      />

      <Section
        title="10. Policy Updates"
        content={`This policy may be updated periodically to reflect new safety and operational guidelines. Continued use of the App after such updates indicates acceptance of the revised policy.`}
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

