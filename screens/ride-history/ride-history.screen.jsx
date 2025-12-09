import { View, Text, ScrollView, FlatList, RefreshControl } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { styles } from "@/screens/home/styles";
import color from "@/themes/app.colors";
import RideCard from "@/components/ride/ride.card";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { windowHeight, windowWidth } from "@/themes/app.constant";
import { useGetUserData, useGetUserRideHistories } from "@/hooks/useGetUserData";
import RideHistorySkeleton from "./ride-history-skelton.screen";

export default function RideHistoryScreen() {

    const { recentRides, loading, refetchRides } = useGetUserRideHistories();
    const [refreshing, setRefreshing] = useState(false);

    // 🚀 Pull to refresh logic
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetchRides(); // 👈 just re-fetch backend data
        setRefreshing(false);
    }, [refetchRides]);

    if (loading) return <RideHistorySkeleton />; // 👈 show shimmer while loading

    return (
        <ScrollView
            style={[
                styles.rideContainer,
                {
                    // backgroundColor: color.lightGray,
                    paddingTop: windowHeight(40),
                    flex: 1
                },
            ]}

            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={color.primary}
                />
            }
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
                        color: color.primaryText
                    }}>
                        You didn't take any ride yet!
                    </Text>
                }
                contentContainerStyle={{ paddingBottom: windowWidth(60) }}
                showsVerticalScrollIndicator={false}

            />
        </ScrollView>
    );
}