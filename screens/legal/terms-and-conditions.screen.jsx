import { View, Text, ScrollView } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import color from "@/themes/app.colors";

export default function TermsConditions() {
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            style={{
                flex: 1,
                backgroundColor: color.background,
                paddingHorizontal: windowWidth(20),
                paddingTop: windowHeight(40),
                paddingBottom: windowHeight(50),
                marginBottom: 0
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
                Terms & Conditions
            </Text>

            <Section
                title="1. Introduction"
                content={`Welcome to our ride-booking platform (“Stark”). By accessing or using our services, you agree to comply with these Terms & Conditions. These terms constitute a legally binding agreement between you and the Company .`}
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
                content={`Users must:
• Treat drivers with respect and maintain proper conduct.
• Avoid damage to vehicles or misusing the service.
• Not use the platform for unlawful activities.
Failure to follow these may lead to account suspension or permanent deactivation.`}
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
                content={`For questions, feedback, or complaints, please reach out to our support team at:
“Help & Support” section in the App.`}
            />

            <Text
                style={{
                    fontSize: fontSizes.FONT14,
                    color: "#999",
                    textAlign: "center",
                    marginTop: 20,
                    fontFamily: "TT-Octosquares-Medium",
                    marginBottom: 25
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
