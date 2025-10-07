import Images from "@/utils/images";
import React from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";

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
      <View style={[styles.container, type === "success" ? styles.success : styles.error]}>
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
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    minHeight: height * 0.25, // quarter screen
  },
  success: {
    backgroundColor: "#E8F5E9",
  },
  error: {
    backgroundColor: "#FFEBEE",
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'TT-Octosquares-Medium',
    color: "#333",
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    fontFamily: 'TT-Octosquares-Medium',

  },
});

export default FooterModal;
