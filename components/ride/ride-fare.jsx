import { fontSizes } from "@/themes/app.constant";
import calculateFare from "@/utils/ride/calculateFare";
import { parseDuration } from "@/utils/time/parse.duration";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function RideFare({ driver, distance, travelTimes, district }) {
    const [fare, setFare] = useState(null);

    useEffect(() => {
        const fetchFare = async () => {
            if (!driver || !distance || !travelTimes?.driving) return;

            const result = await calculateFare({
                driver,
                distance,
                duration: parseDuration(travelTimes.driving),
                district
            });

            if (result) {
                setFare(result.totalFare);
            }
        };

        fetchFare();
    }, [driver, distance, travelTimes]);

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
