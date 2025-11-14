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
});

export { styles };