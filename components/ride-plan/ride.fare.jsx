import color from "@/themes/app.colors";
import { fontSizes } from "@/themes/app.constant";
import calculateFare from "@/utils/ride/calculateFare";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function RideFare({ driver, distance, district }) {
    const [fareData, setFareData] = useState(null);
    useEffect(() => {
        const fetchFare = async () => {
            if (!driver || !distance) return;

            const result = await calculateFare({
                driver,
                distance,
                district,
            });

            if (result) {
                setFareData(result);   // ✅ store full object
            }
        };

        fetchFare();
    }, [driver, distance]);

    // Generate a dummy fare (e.g., 20% higher than actual)
    const fare = fareData?.totalFare || null;
    const isNight = fareData?.isNightChargeApplied;
    const dummyFare = fare ? Math.round(fare * 1.2) : null;

    return (
        <View style={{ gap: 4 }}>

            {/* 🌙 NIGHT INFO ROW */}
            {isNight && (
                <Text
                    style={{
                        fontSize: fontSizes.FONT12,
                        color: "#FFD700",
                        fontFamily: "TT-Octosquares-Medium",
                    }}
                >
                    🌙 Night charges applied
                </Text>
            )}

            {/* 💰 FARE ROW */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: 'flex-end' }}>
                <Text
                    style={{
                        fontSize: fontSizes.FONT14,
                        fontFamily: "TT-Octosquares-Medium",
                        color: color.primaryText,
                    }}
                >
                    {fare !== null ? `₹${fare}` : "Calculating..."}
                </Text>

                {dummyFare !== null && (
                    <Text
                        style={{
                            fontSize: fontSizes.FONT13,
                            color: color.secondaryFont,
                            textDecorationLine: "line-through",
                            fontFamily: "TT-Octosquares-Medium",
                        }}
                    >
                        ₹{dummyFare}
                    </Text>
                )}
            </View>

        </View>
    );
}
