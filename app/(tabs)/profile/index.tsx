import { View, Text } from "react-native";
import React from "react";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import Input from "@/components/common/input";
import SelectInput from "@/components/common/select-input";
import Button from "@/components/common/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useGetUserData } from "@/hooks/useGetUserData";
import { logout } from "@/api/apis";

export default function Profile() {
    const { user, loading } = useGetUserData();

    if (loading) {
        return;
    }

    // console.log(user);

    return (
        <View style={{ paddingTop: 70 }}>
            <Text
                style={{
                    textAlign: "center",
                    fontSize: fontSizes.FONT30,
                    fontWeight: "600",
                    fontFamily:'TT-Octosquares-Medium'
                }}
            >
                My Profile
            </Text>
            <View style={{ padding: windowWidth(20) }}>
                <Input
                    title="Name"
                    value={user?.name}
                    onChangeText={() => console.log("")}
                    placeholder={user?.name!}
                    disabled={true}
                />
                <Input
                    title="Email Address"
                    value={user?.email}
                    onChangeText={() => console.log("")}
                    placeholder={user?.email!}
                    disabled={true}
                />
                <Input
                    title="Phone Number"
                    value={user?.phone_number}
                    onChangeText={() => console.log("")}
                    placeholder={user?.phone_number!}
                    disabled={true}
                />
                <View style={{ marginVertical: 25 }}>
                    <Button
                        onPress={()=> logout()}
                        title="Log Out"
                        backgroundColor="crimson"
                        disabled={false}
                    />
                </View>
            </View>
        </View>
    );
}