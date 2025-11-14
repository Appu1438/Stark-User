import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  BackHandler
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { router, useFocusEffect } from 'expo-router';

import { styles } from './styles';
import { slides } from '@/configs/constants';
import Images from '@/utils/images';
import color from '@/themes/app.colors';
import { BackArrow } from '@/utils/icons';

const { width, height } = Dimensions.get('window');

export default function OnBoardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Exit", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true }
        );
        return true; // Prevent default back behavior
      };

      if (Platform.OS === "android") {
        const subscription = BackHandler.addEventListener(
          "hardwareBackPress",
          onBackPress
        );

        // Cleanup on unmount
        return () => subscription.remove();
      }
    }, [])
  );


  return (
    <View style={{
      flex: 1,
      // backgroundColor: color.whiteColor 
    }}>
      <Carousel
        width={width}
        height={height}
        data={slides}
        scrollAnimationDuration={1500}
        autoPlay={false}
        pagingEnabled
        onSnapToItem={(index) => setCurrentIndex(index)}
        mode="parallax" // or try "stack" / "horizontal-stack" / "vertical-stack"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
          parallaxAdjacentItemScale: 0.8,
        }}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            <Image style={styles.imageBackground} source={item.image} />
            <View style={styles.imageBgView}>
              <ImageBackground
                resizeMode='stretch'
                style={styles.img}
                source={Images.bgOnboarding}
              >
                <Text style={styles.title}>{item.text}</Text>
                <Text style={styles.description}>{item.description}</Text>

                {/* Dots inside the image */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
                  {slides.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        width: currentIndex === i ? 16 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: currentIndex === i ? color.buttonBg : '#ccc',
                        marginHorizontal: 4,
                      }}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.backArrow}
                  onPress={() => router.push('/(routes)/login')}
                >
                  <BackArrow colors={color.primary} width={21} height={21} />
                </TouchableOpacity>
              </ImageBackground>
            </View>
          </View>
        )}
      />
    </View>
  );
}
