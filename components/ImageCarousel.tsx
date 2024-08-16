import { ScreenWidth } from "@rneui/base";
import React, { useState } from "react";
import { View, Image } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import AnimatedDotsCarousel from "react-native-animated-dots-carousel";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

const ImageCarousel = ({ data, theme }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const renderCarouselItem = ({ item }) => (
    <View style={{ width: ScreenWidth, height: ScreenWidth }}>
      <Image
        source={{ uri: item }}
        style={{
          alignSelf: "center",
          borderRadius: 20,
          width: ScreenWidth * 0.9,
          height: ScreenWidth * 0.9 * 1.25,
          resizeMode: "cover",
        }}
      />
    </View>
  );

  return (
    <View style={{ alignItems: "center" }}>
      {data?.length > 1 ? (
        <>
          <Carousel
            panGestureHandlerProps={{
              activeOffsetX: [-10, 10],
            }}
            data={data}
            renderItem={renderCarouselItem}
            width={ScreenWidth}
            height={ScreenWidth * 0.92 * 1.25}
            loop={false}
            onProgressChange={(_offsetProgress, absoluteProgress) => {
              const index = Math.round(absoluteProgress);
              setCurrentIndex(index);
            }}
          />
          <AnimatedDotsCarousel
            length={data?.length}
            currentIndex={currentIndex}
            maxIndicators={data?.length}
            activeIndicatorConfig={{
              color: theme.colors.black,
              margin: 3,
              opacity: 1,
              size: 8,
            }}
            inactiveIndicatorConfig={{
              color: theme.colors.black,
              margin: 3,
              opacity: 0.5,
              size: 6,
            }}
            decreasingDots={[
              {
                config: {
                  color: theme.colors.black,
                  margin: 3,
                  opacity: 0.5,
                  size: 6,
                },
                quantity: 1,
              },
            ]}
          />
        </>
      ) : data?.length == 1 ? (
        <Image
          source={{ uri: data[0] }}
          style={{
            alignSelf: "center",
            borderRadius: 15,
            width: 0.9 * ScreenWidth,
            height: 0.9 * ScreenWidth * 1.25,
            resizeMode: "cover",
          }}
        />
      ) : null}
    </View>
  );
};

export default ImageCarousel;
