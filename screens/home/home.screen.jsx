import { View, Text, SafeAreaView, FlatList, ScrollView, Platform } from "react-native";
import { styles } from "./styles";
import { commonStyles } from "@/styles/common.style";
import { external } from "@/styles/external.style";
import LocationSearchBar from "@/components/location/location.search.bar";
import color from "@/themes/app.colors";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import RideCard from "@/components/ride/ride.card";
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler, Alert } from 'react-native';
import { useCallback } from 'react';
import { MiniTaxi } from "@/assets/icons/miniTaxi";
import { Taxi } from "@/utils/icons";
import socketService from "@/utils/socket/socketService";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Toast } from "react-native-toast-notifications";
import { useGetUserData, useGetUserRideHistories } from "@/hooks/useGetUserData";
import axiosInstance from "@/api/axiosInstance";
export default function HomeScreen() {

    const { recentRides } = useGetUserRideHistories()

    useEffect(() => {
        socketService.connect();

        socketService.clearListeners();
        return () => {
            socketService.clearListeners();
            socketService.disconnect();
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    "Exit App",
                    "Are you sure you want to exit?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Exit", onPress: () => BackHandler.exitApp() },
                    ],
                    { cancelable: true }
                );
                return true; // Prevent default back behavior
            };

            if (Platform.OS === "android") {
                const subscription = BackHandler.addEventListener(
                    "hardwareBackPress",
                    onBackPress
                );

                // Cleanup on unmount
                return () => subscription.remove();
            }
        }, [])
    );


    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    async function registerForPushNotificationsAsync() {
        const accessToken = await AsyncStorage.getItem("accessToken");

        if (Device.isDevice) {
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== "granted") {
                Toast.show("Failed to get push token for push notification!", {
                    type: "danger",
                });
                return;
            }
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ??
                Constants?.easConfig?.projectId;
            if (!projectId) {
                Toast.show("Failed to get project id for push notification!", {
                    type: "danger",
                });
            }
            try {
                const pushTokenString = (
                    await Notifications.getExpoPushTokenAsync({
                        projectId,
                    })
                ).data;
                await axiosInstance.put(
                    `/update-push-token`,
                    { token: pushTokenString },
                );
                console.log(pushTokenString);
                // return pushTokenString;
            } catch (e) {
                Toast.show(`${e}`, {
                    type: "danger",
                });
            }
        } else {
            Toast.show("Must use physical device for Push Notifications", {
                type: "danger",
            });
        }

        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }
    }


    return (
        <View style={[commonStyles.flexContainer, { backgroundColor: "#fff" }]}>
            <SafeAreaView style={styles.container}>
                <View style={[external.p_5, external.ph_20]}>
                    <Text
                        style={{
                            fontFamily: "TT-Octosquares-Medium",
                            fontSize: 25,
                        }}
                    >
                        Stark
                    </Text>
                    <LocationSearchBar />
                </View>
                <View style={{ padding: 5 }}>
                    <View
                        style={[
                            styles.rideContainer,
                            { backgroundColor: color.whiteColor },
                        ]}
                    >
                        <Text style={[styles.rideTitle, { color: color.regularText }]}>
                            Recent Rides
                        </Text>
                        <FlatList
                            data={recentRides.slice(0, 6)} // slice if you want to skip the first item
                            keyExtractor={(item, index) => item.id || index.toString()}
                            renderItem={({ item }) => <RideCard item={item} />}
                            ListEmptyComponent={
                                <Text style={{
                                    fontFamily: "TT-Octosquares-Medium",
                                    marginBottom: 12,
                                    color: "#222",
                                }}>
                                    You didn't take any ride yet!
                                </Text>
                            }
                            contentContainerStyle={{ paddingBottom: 10 }}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}