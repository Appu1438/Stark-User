import { View, Text, ScrollView } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

export default function CancellationPolicy() {
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
        Cancellation Policy
      </Text>

      <Section
        title="1. Overview"
        content={`This Cancellation  Policy applies to riders using the Stark App. It outlines how cancellations and refunds are handled to maintain fairness between riders and drivers while ensuring transparent operations.`}
      />

      <Section
        title="2. Free Cancellation Policy"
        content={`Riders may cancel a booking without any fee under the following circumstances:
• If the driver has not yet accepted your ride request.  
• If the driver has accepted the request but has not yet started traveling toward your pickup location.  
`}
      />

      <Section
        title="3. Cancellation After Driver Dispatch"
        content={`If you cancel a ride after the driver has started traveling toward your pickup point, a **nominal cancellation charge** may apply to compensate for the driver’s time and fuel.  
The charge typically ranges between **₹100 and ₹200**, depending on the estimated distance and time.  
If you had prepaid, the remaining balance after deduction will be **credited back to your wallet immediately.**`}
      />

      <Section
        title="4. Cancellation After Driver Arrival"
        content={`If the driver has already arrived at your pickup location and you cancel the ride, a **cancellation fee (₹100–₹200)** will be applied. The remaining ride amount, if any, will be **refunded to your in-app wallet automatically.**`}
      />

      <Section
        title="5. Cancellation During an Ongoing Ride"
        content={`If you cancel an ongoing ride, you will be charged for the **distance already traveled** before cancellation. The system automatically calculates this amount based on GPS data.  
The remaining balance (if applicable) will be **instantly credited to your wallet** after deduction.`}
      />

      {/* <Section
        title="6. Refund Processing"
        content={`Refunds for eligible cancellations are credited **instantly to your Stark Wallet**.  
Wallet balance can be used for future rides or withdrawn to your linked payment method if supported.  
Bank refunds (if applicable) may take up to 5–7 business days, depending on your payment provider.`}
      /> */}

      <Section
        title="6. Disputes & Review"
        content={`If you believe a cancellation fee was applied incorrectly, you can submit a complaint through the “Register Complaint” section in the App.  
Our support team will review your case and provide a resolution within 48 hours.`}
      />

      <Section
        title="7. Exceptional Circumstances"
        content={`In special cases such as:
• Driver arriving extremely late,  
• Incorrect pickup or route,  
• App or network malfunction —  
the cancellation fee may be **waived** or **refunded in full** after review by our support team.`}
      />

      <Section
        title="8. Updates to Policy"
        content={`This policy may be updated periodically to align with operational or regulatory changes.  
Users will be notified of major updates through in-app alerts or email communication.`}
      />

      <Section
        title="9. Contact Information"
        content={`For any refund-related queries or clarification, please reach out via the “Help & Support” section in the App.`}
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
