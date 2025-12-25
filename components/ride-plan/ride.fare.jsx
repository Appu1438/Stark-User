import color from "@/themes/app.colors";
import { fontSizes } from "@/themes/app.constant";
import calculateFare from "@/utils/ride/calculateFare";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function RideFare({ driver, distance, district }) {
    const [fare, setFare] = useState(null);

    useEffect(() => {
        const fetchFare = async () => {
            if (!driver || !distance) return;

            const result = await calculateFare({
                driver,
                distance,
                district,
            });

            if (result) {
                setFare(result.totalFare);
            }
        };

        fetchFare();
    }, [driver, distance]);

    // Generate a dummy fare (e.g., 20% higher than actual)
    const dummyFare = fare ? Math.round(fare * 1.2) : null;

    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
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
                        textDecorationLine: "line-through", // strike-through
                        fontFamily: "TT-Octosquares-Medium",
                    }}
                >
                    ₹{dummyFare}
                </Text>
            )}

        </View>
    );
}
