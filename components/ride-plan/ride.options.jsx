import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import RideFare from "./ride.fare"; // assuming your RideFare component
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";
import { LeftArrow } from "@/utils/icons";
import estimateArrivalFromDriver from "@/utils/ride/getEstimatedDriverArrival";
import getEstimatedArrivalTime from "@/utils/ride/getEstimatedArrival";
import Button from "../common/button";

export default function RideOptions({
  driverLists,
  driverLoader,
  distance,
  district,
  travelTimes,
  currentLocation,
  vehicleImages,
  vehicleNames,
  selectedVehcile,
  setselectedVehcile,
  handleOrder,
  watingForBookingResponse,
  setlocationSelected,
}) {

  return (
    <View style={{
      paddingBottom: windowHeight(0),
      height: windowHeight(280),
    }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#b5b5b5",
          paddingBottom: windowHeight(10),
          flexDirection: "row",
        }}
      >
        <Pressable onPress={() => setlocationSelected(false)}>
          <LeftArrow />
        </Pressable>
        <Text
          style={{
            margin: "auto",
            fontSize: 20,
            fontWeight: "600",
            fontFamily: 'TT-Octosquares-Medium',
            color: color.primaryText
          }}
        >
          Gathering Options
        </Text>
      </View>

      {driverLoader ? (
        // Loader while fetching drivers
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            height: 400,
          }}
        >
          <ActivityIndicator size={"large"} />
        </View>
      ) : (
        (() => {
          // ✅ Unique vehicle types
          const uniqueVehicleTypes = Array.from(
            new Set(driverLists?.map((d) => d.vehicle_type))
          );

          // Filter only those types with drivers
          const availableVehicleTypes = uniqueVehicleTypes.filter((vehicleType) =>
            driverLists.some(
              (d) => d.vehicle_type === vehicleType && d.latitude && d.longitude
            )
          );

          let sortedVehicleTypes;
          if (availableVehicleTypes.length > 0) {
            // console.log(availableVehicleTypes)
            const vehicleOrder = ["Hatchback", "Sedan", "Suv"];
            // Sort availableVehicleTypes according to vehicleOrder
            sortedVehicleTypes = availableVehicleTypes.sort(
              (a, b) => vehicleOrder.indexOf(a) - vehicleOrder.indexOf(b)
            );
            // console.log('sorted', sortedVehicleTypes)
          }
          // ✅ If no available vehicles, show message
          if (availableVehicleTypes.length === 0) {
            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: windowWidth(10),
                }}
              >
                <Text
                  style={{
                    fontSize: fontSizes.FONT18,
                    color: color.primaryText
                    , textAlign: "center",
                    fontFamily: 'TT-Octosquares-Medium'
                  }}
                >
                  No drivers available in your area.
                </Text>
              </View>
            );
          }

          // ✅ Otherwise show available vehicle types + confirm button
          return (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>

                {sortedVehicleTypes.map((vehicleType) => {
                  const driversForType = driverLists.filter(
                    (d) => d.vehicle_type === vehicleType && d.latitude && d.longitude
                  );

                  return (
                    <Pressable
                      key={vehicleType}
                      onPress={() => setselectedVehcile(vehicleType)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 15,
                        marginVertical: 6,
                        borderRadius: 16,
                        borderWidth: selectedVehcile === vehicleType ? 2 : 1,
                        borderColor: selectedVehcile === vehicleType ? color.primaryGray : color.border,
                        backgroundColor: color.subPrimary,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 5,
                        elevation: 3,
                      }}
                    >
                      {/* Vehicle Image */}
                      <View>

                        <Image
                          source={vehicleImages[vehicleType] || vehicleImages["Sedan"]}
                          style={{ width: 65, height: 55, alignSelf: 'center' }}
                          resizeMode="contain"
                        />
                        {driversForType[0].latitude && driversForType[0].longitude && currentLocation && (
                          <Text style={{ fontSize: fontSizes.FONT10, color: color.primaryText, fontFamily: "TT-Octosquares-Medium", alignSelf: 'center' }}>
                            {estimateArrivalFromDriver(driversForType[0], currentLocation)} away
                          </Text>
                        )}
                      </View>

                      {/* Vehicle Info */}
                      <View style={{ flex: 1 }}>
                        {/* Top Row: Vehicle Name + Fare */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ fontSize: fontSizes.FONT18, fontFamily: "TT-Octosquares-Medium", color: color.primaryText }}>
                            {vehicleNames[vehicleType]}
                          </Text>

                          <RideFare
                            driver={driversForType[0]}
                            distance={distance}
                            district={district}
                          />
                        </View>

                        {/* Divider */}
                        <View
                          style={{
                            height: 1,
                            backgroundColor: "#eee",
                            marginVertical: 6,
                          }}
                        />

                        {/* Middle Row: Capacity + Distance */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 5,
                          }}
                        >
                          <Text style={{ fontSize: fontSizes.FONT14, color: color.primaryText, fontFamily: "TT-Octosquares-Medium" }}>
                            Capacity: {driversForType[0].capacity}
                          </Text>

                          {distance && (
                            <Text style={{ fontSize: fontSizes.FONT14, color: color.primaryText, fontFamily: "TT-Octosquares-Medium" }}>
                              Distance: {distance.toFixed(2)} km
                            </Text>
                          )}
                        </View>

                        {/* Divider */}
                        <View
                          style={{
                            height: 1,
                            backgroundColor: "#eee",
                            marginVertical: 6,
                          }}
                        />

                        {/* Bottom Row: ETD & ETA */}
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          {travelTimes.driving && (
                            <Text style={{ fontSize: fontSizes.FONT12, color: color.primaryText, fontFamily: "TT-Octosquares-Medium" }}>
                              Estimated Arrival: {getEstimatedArrivalTime(travelTimes.driving)}
                            </Text>
                          )}
                        </View>
                      </View>
                    </Pressable>



                  );

                })}
              </ScrollView>

              {/* ✅ Confirm Button */}
              <View
                style={{
                  paddingHorizontal: windowWidth(10),
                  marginTop: windowHeight(15),
                }}
              >
                <Button
                  title="Confirm Booking"
                  onPress={() => handleOrder()}
                  disabled={watingForBookingResponse}
                />
              </View>
            </>

          );

        })()

      )}
    </View>
  );
}
