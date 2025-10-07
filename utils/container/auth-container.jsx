import { external } from "@/styles/external.style";
import React, { ReactNode, useEffect, useRef } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Animated,
} from "react-native";
import Images from "../images";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { styles } from './styles';


const AuthContainer = ({ container, topSpace, imageShow }) => {

    return (
        <KeyboardAvoidingView
            style={[external.fx_1]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -90}

        >
            <View style={[external.fx_1]}>
                {imageShow && (
                    <Text
                        style={{
                            fontFamily: "TT-Octosquares-Medium",
                            fontSize: windowWidth(25),
                            paddingTop: windowHeight(50),
                            textAlign: "center",
                        }}
                    >
                        Stark
                    </Text>
                )}

                <Image
                    style={[styles.backgroundImage, { marginTop: topSpace }]}
                    source={Images.authBg}
                />

                <View style={styles.contentContainer}>
                    <View style={[styles.container]}>
                        <ScrollView>{container}</ScrollView>
                    </View>
                </View>

            </View>
        </KeyboardAvoidingView >

    );
};

export default AuthContainer;
