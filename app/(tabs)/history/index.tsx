import { View, Text, ScrollView, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { styles } from "@/screens/home/styles";
import color from "@/themes/app.colors";
import RideCard from "@/components/ride/ride.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { windowHeight } from "@/themes/app.constant";
import { useGetUserData, useGetUserRideHistories } from "@/hooks/useGetUserData";

export default function History() {

    const { recentRides } = useGetUserRideHistories()

    return (
        <View
            style={[
                styles.rideContainer,
                { backgroundColor: color.lightGray, paddingTop: windowHeight(40) },
            ]}
        >
            <Text
                style={[
                    styles.rideTitle,
                    {
                        color: color.primaryText, fontWeight: "600", fontFamily: 'TT-Octosquares-Medium'
                    },
                ]}
            >
                Ride History
            </Text>
            <FlatList
                data={recentRides} // slice if you want to skip the first item
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
    );
}