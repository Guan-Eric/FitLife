import React, { useEffect, useState } from "react";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { ChartData } from "./types";
import { View } from "react-native";
import { Circle, useFont } from "@shopify/react-native-skia";
import { SharedValue, useDerivedValue } from "react-native-reanimated";
import { Lato_400Regular } from "@expo-google-fonts/lato";
import { ButtonGroup } from "@rneui/themed";
import { Text } from "react-native";
import { format, subDays, subMonths, subWeeks } from "date-fns";

interface WorkoutSummaryChartProps {
  dailyChartData: ChartData[];
  weeklyChartData: ChartData[];
  monthlyChartData: ChartData[];
  theme;
}

const WorkoutSummaryChart: React.FC<WorkoutSummaryChartProps> = ({
  dailyChartData,
  weeklyChartData,
  monthlyChartData,
  theme,
}) => {
  const font = useFont(Lato_400Regular, 12);
  const dailyTransformData = dailyChartData.map(({ x, y }) => ({ x, y }));
  const weeklyTransformData = weeklyChartData.map(({ x, y }) => ({ x, y }));
  const monthlyTransformData = monthlyChartData.map(({ x, y }) => ({ x, y }));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });
  const [transformedData, setTransformedData] = useState(dailyTransformData);

  useEffect(() => {
    switch (selectedIndex) {
      case 0:
        setTransformedData(dailyTransformData);
        break;
      case 1:
        setTransformedData(weeklyTransformData);
        break;
      case 2:
        setTransformedData(monthlyTransformData);
        break;
    }
  }, [selectedIndex, dailyChartData, weeklyChartData, monthlyChartData]);

  const value = useDerivedValue(() => {
    const timeValue = state.y.y.value.value;

    const hours = Math.floor(timeValue / 3600);
    const minutes = Math.floor((timeValue % 3600) / 60);
    const seconds = timeValue % 60;

    if (hours > 0) {
      return `${hours} h ${minutes} m` as string;
    } else return `${minutes} m ${seconds} s` as string;
  }, [state]);

  return (
    <View style={{ height: 300 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: theme.colors.black, fontSize: 24 }}>
          {value.value}
        </Text>
        <ButtonGroup
          containerStyle={{ width: 200 }}
          buttons={["Daily", "Weekly", "Monthly"]}
          selectedIndex={selectedIndex}
          onPress={(value) => {
            setSelectedIndex(value);
          }}
        />
      </View>
      <CartesianChart
        data={transformedData}
        xKey="x"
        yKeys={["y"]}
        domainPadding={{ top: 30 }}
        xAxis={{
          lineColor: theme.colors.grey0,
          font: font,
          labelColor: theme.colors.black,
          formatXLabel(label) {
            if (selectedIndex === 0) {
              return format(subDays(new Date(), 6 - label), "EEEE");
            } else if (selectedIndex === 1) {
              return format(subWeeks(new Date(), 6 - label), "MMM dd");
            } else {
              return format(subMonths(new Date(), 6 - label), "MMM yyyy");
            }
          },
        }}
        yAxis={[
          {
            lineColor: theme.colors.grey0,
            font: font,
            labelColor: theme.colors.black,
            formatYLabel(label) {
              const hours = Math.floor(label / 3600);
              const minutes = Math.floor((label % 3600) / 60);
              const seconds = label % 60;

              if (hours > 0) {
                return `${hours} h ${minutes} m` as string;
              } else return `${minutes} m ${seconds} s` as string;
            },
          },
        ]}
        chartPressState={state}
      >
        {({ points }) => (
          <>
            <Line
              points={points.y}
              color={theme.colors.primary}
              strokeWidth={3}
              animate={{ type: "timing", duration: 500 }}
            />
            {isActive ? (
              <Circle
                cx={state.x.position}
                cy={state.y.y.position}
                r={8}
                color={theme.colors.primary}
                opacity={0.8}
              />
            ) : null}
          </>
        )}
      </CartesianChart>
    </View>
  );
};

export default WorkoutSummaryChart;
