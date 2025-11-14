import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable, Dimensions } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Clock, Gps, LeftArrow, PickLocation, RightArrow, Location } from "@/utils/icons";
import color from "@/themes/app.colors";
import { fontSizes, windowHeight, windowWidth } from "@/themes/app.constant";

export default function RideLocationSelector({
  router,
  currentLocation,
  marker,
  setlocationSelected,
  currentLocationName,
  destLocationName,
  fromSearchInputRef,
  toSearchInputRef,
  setFromPlaces,
  setPlaces,
  fromPlaces,
  places,
  handleFromPlaceSelect,
  handlePlaceSelect,
  setkeyboardAvoidingHeight,
  setQuery,
  setFromQuery,
  fromQuery,
  query
}) {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <LeftArrow />
        </TouchableOpacity>
        <Text style={{
          margin: 'auto',
          fontSize:fontSizes.FONT20,
          fontWeight: '600',
          fontFamily: 'TT-Octosquares-Medium',
          color: color.primaryText


        }}>
          Plan Your Ride
        </Text>
        {currentLocation && marker && (
          <TouchableOpacity onPress={() => setlocationSelected(true)}>
            <RightArrow iconColor={color.primaryText} />
          </TouchableOpacity>
        )}
      </View>

      <View style={{
        width: windowWidth(200),
        height: windowHeight(28),
        borderRadius: 20,
        backgroundColor: color.buttonBg,
        alignItems: "center",
        justifyContent: 'center',
        marginVertical: windowHeight(18)
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Clock />
          <Text style={{
            fontSize: fontSizes.FONT15,
            paddingHorizontal: 8,
            fontFamily: 'TT-Octosquares-Medium'

          }}>
            Pick-up Now
          </Text>
        </View>
      </View>

      <View style={{
        borderWidth: 2, borderColor: color.border, borderRadius: 15,
        marginBottom: windowHeight(15),
        paddingHorizontal: windowWidth(15),
        paddingVertical: windowHeight(10)
      }}>
        <View style={{ flexDirection: 'row' }}>
          <Location colors={color.primaryGray} />
          <View style={{
            borderBottomWidth: 1,
            borderBottomColor: color.primaryGray,
            width: Dimensions.get('window').width * 1 - 110,
            marginLeft: 5,
            height: windowHeight(30),
          }}>
            <GooglePlacesAutocomplete
              ref={fromSearchInputRef}
              placeholder={currentLocationName}
              onPress={(data) => {
                setFromPlaces([{ ...data }]);
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                language: 'en',
              }}
              styles={{
                textInputContainer: {
                  width: '100%',
                  // backgroundColor:color.red
                },
                textInput: {
                  height: 25,
                  color: color.primaryText,
                  fontSize: 13,
                  fontFamily: 'TT-Octosquares-Medium',
                  backgroundColor: color.subPrimary
                },

              }}
              textInputProps={{
                onChangeText: setFromQuery,
                value: fromQuery,
                onFocus: () => setkeyboardAvoidingHeight(true),
                onBlur: () => setkeyboardAvoidingHeight(false),
                placeholderTextColor: color.primaryText
              }}
              fetchDetails={true}
              debounce={200}
              predefinedPlaces={[]}
            />
          </View>
        </View>

        <View style={{
          flexDirection: 'row',
          paddingVertical: 12,
        }}>
          <Gps colors={color.primaryGray} />
          <View style={{
            marginLeft: 5,
            width: Dimensions.get('window').width * 1 - 110,
          }}>
            <GooglePlacesAutocomplete
              ref={toSearchInputRef}
              placeholder={destLocationName}
              onPress={(data) => {
                setPlaces([{ ...data }]);
              }}
              query={{
                key: process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY,
                language: 'en',
              }}
              styles={{
                textInputContainer: { width: '100%' },
                textInput: {
                  height: 25,
                  color: color.primaryText,
                  fontSize: 13,
                  fontFamily: 'TT-Octosquares-Medium',
                  backgroundColor: color.subPrimary
                },
              }}
              textInputProps={{
                onChangeText: setQuery,
                value: query,
                onFocus: () => setkeyboardAvoidingHeight(true),
                onBlur: () => setkeyboardAvoidingHeight(false),
                placeholderTextColor: color.primaryText,
              }}
              fetchDetails={true}
              debounce={200}
              predefinedPlaces={[]}

            />
          </View>
        </View>
      </View>

      <ScrollView style={{ maxHeight: windowHeight(150) }} keyboardShouldPersistTaps="handled">
        {fromPlaces?.map((place, index) => (
          <Pressable
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: windowHeight(10),
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 8,
              marginTop: 4,
              borderBottomWidth: 1,
              borderBottomColor: color.primaryGray,
              // width: Dimensions.get('window').width * 1 - 110,
            }}
            onPress={() => handleFromPlaceSelect(place.place_id, place.description)}
          >
            <Location colors={color.primaryGray} />
            <Text style={{
              paddingLeft: 15,
              fontSize: fontSizes.FONT16,
              flexShrink: 1,
              color: color.primaryText,
              fontFamily: 'TT-Octosquares-Medium'
            }}>
              {place.description || 'Unknown location'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={{ maxHeight: windowHeight(150) }} keyboardShouldPersistTaps="handled">
        {places?.map((place, index) => (
          <Pressable
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: windowHeight(10),
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 8,
              marginTop: 4,
              borderBottomWidth: 1,
              borderBottomColor: color.primaryGray,
            }}
            onPress={() => handlePlaceSelect(place.place_id, place.description)}
          >
            <Gps colors={color.primaryText} />
            <Text style={{
              paddingLeft: 15,
              fontSize: fontSizes.FONT15,
              flexShrink: 1,
              color: color.primaryText,
              fontFamily: 'TT-Octosquares-Medium'

            }}>
              {place.description || 'Unknown location'}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
