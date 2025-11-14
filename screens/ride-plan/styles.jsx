
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { windowHeight } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        ...commonStyles.shadowContainer,
        backgroundColor: color.subPrimary,
        paddingHorizontal: windowHeight(15),
        paddingVertical: windowHeight(26),
        borderStartStartRadius: windowHeight(16),
        borderStartEndRadius: windowHeight(16),
        borderTopRightRadius: windowHeight(16),
        borderTopLeftRadius: windowHeight(16),
        zIndex: 20


    },
    backgroundImage: {
        width: "100%",
        height: windowHeight(150),
        // marginTop: windowHeight(150),
        position: "absolute",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "flex-end",
        zIndex: 20
    },
    img: {
        height: windowHeight(28),
        width: windowHeight(90),
        ...external.as_center,
        ...external.mt_50,
        resizeMode: "contain",
    },
    vehicleIcon: {
        width: 45,
        height: 45,
        resizeMode: 'contain',
        // Note: The rotation transform is still applied inline above.
    },

    // 🚩 Custom Destination Pin (A clean, solid pin)
    destinationPinContainer: {
        width: 20,
        height: 20,
        backgroundColor: '#FF0057', // High-contrast Red/Pink
        borderRadius: 10,
        borderWidth: 3,
        borderColor: '#fff', // White border for pop
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Optional inner dot for the destination
    destinationPinInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },

    // 🧭 Custom Pickup Dot (A clean circle with a pulse effect look)
    pickupDot: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#00cc00', // Solid green or primary brand color
        borderWidth: 2,
        borderColor: '#fff',
    },
});

export { styles };
