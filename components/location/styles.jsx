import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.lightGray,
    height: windowHeight(38),
    borderRadius: windowHeight(20),
    marginTop: windowHeight(10),
    paddingHorizontal: windowWidth(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: windowWidth(8),
  },
  textInputStyle: {
    ...commonStyles.regularText,
    fontSize: fontSizes.FONT19,
    fontWeight: "500",
    color: "#000",
    fontFamily: 'TT-Octosquares-Medium'
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: windowWidth(10),
    height: windowHeight(28),
  },
  nowText: {
    fontSize: windowHeight(12),
    fontWeight: "600",
    paddingHorizontal: windowWidth(6),
    fontFamily: 'TT-Octosquares-Medium'

  },
});

export { styles };
