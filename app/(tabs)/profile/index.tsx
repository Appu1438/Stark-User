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
import Profile from "@/screens/profile/profile.screen";

export default function index() {
    return (
        <Profile />
    )
}