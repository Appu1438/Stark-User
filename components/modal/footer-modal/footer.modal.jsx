import color from "@/themes/app.colors";
import Images from "@/utils/images";
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons"; // ⭐ NEW

const { height } = Dimensions.get("window");

const FooterModal = ({
  isVisible,
  type = "success",
  title,
  subText,
  onHide,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onHide}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View
        style={[
          styles.container,
          type === "success" ? styles.success : styles.error,
        ]}
      >
        {/* ⭐ Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onHide}>
          <Ionicons name="close" size={24} color={color.primaryText} />
        </TouchableOpacity>

        {type === "success" ? (
          <Image source={Images.hurray} style={styles.image} />
        ) : (
          <Image source={Images.sad} style={styles.image} />
        )}

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subText}>{subText}</Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    width: "100%",
    backgroundColor: color.subPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    minHeight: height * 0.25,
    position: "relative", // ⭐ Needed for close button
  },

  success: {
    backgroundColor: color.subPrimary,
  },
  error: {
    backgroundColor: color.subPrimary,
  },

  // ⭐ Close button
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: color.bgDark,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.9,
  },

  image: {
    width: 80,
    height: 80,
    marginBottom: 12,
    marginTop: 20, // ⭐ To give space below close button
  },

  title: {
    fontSize: 18,
    fontFamily: "TT-Octosquares-Medium",
    color: color.primaryText,
    textAlign: "center",
  },

  subText: {
    fontSize: 14,
    color: color.secondaryFont,
    textAlign: "center",
    marginTop: 8,
    fontFamily: "TT-Octosquares-Medium",
  },
});

export default FooterModal;
