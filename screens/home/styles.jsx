import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import fonts from "@/themes/app.fonts";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        paddingTop: windowHeight(30),
    },
    containerStyle: {
        // backgroundColor: color.lightGray,
        ...external.Pb_30,
    },
    rideContainer: {
        paddingHorizontal: windowWidth(20),
        paddingTop: windowHeight(2),
        paddingBottom: windowHeight(3),
    },
    rideTitle: {
        marginVertical: windowHeight(5),
        fontSize: fontSizes.FONT25,
        fontFamily: 'TT-Octosquares-Medium',
        fontWeight: "600",
    },
    stickySearchWrapper: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: windowHeight(40),
        paddingBottom: 5,
        backgroundColor: color.subPrimary,
        zIndex: 999,
    },
    logoText: {
        fontFamily: "TT-Octosquares-Medium",
        fontSize: fontSizes.FONT25,
        color: color.primaryText,
        marginBottom: 0,
    },
    // Hero Card
    heroCard: {
        marginHorizontal: 20, marginBottom: 30, padding: 24, borderRadius: 24,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
    },
    heroTitle: { fontSize: 22, color: "#fff", fontFamily: "TT-Octosquares-Medium", marginBottom: 6 },
    heroSubtitle: { fontSize: 13, color: "#888", fontFamily: "TT-Octosquares-Medium", lineHeight: 20 },
    bookButton: {
        marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12
    },
    bookButtonText: { color: color.primary, fontSize: 14, fontFamily: "TT-Octosquares-Medium", marginRight: 8 },
});

export { styles };