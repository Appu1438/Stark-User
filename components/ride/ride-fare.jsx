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
                district
            });

            if (result) {
                setFare(result.totalFare);
            }
        };

        fetchFare();
    }, [driver, distance]);

    return (
        <View>
            <Text style={{
                fontSize: fontSizes.FONT15, fontWeight: "600", fontFamily: 'TT-Octosquares-Medium'
            }}>
                {fare !== null ? `₹${fare}` : "Calculating..."}
            </Text>
        </View>
    );
}
