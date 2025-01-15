import React, { Ref, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Plan } from "../../../components/types";
import { Button, CheckBox, Input, useTheme } from "@rneui/themed";
import { generatePlan } from "../../../backend/ai";
import { color } from "@rneui/base";
import { ScrollView } from "react-native-gesture-handler";

export default function GeneratePlanScreen() {
  const [plan, setPlan] = useState<Plan>(null);
  const [goal, setGoal] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [equipment, setEquipment] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { theme } = useTheme();

  const handleGeneratePlan = async () => {
    setLoading(true);
    setPlan(await generatePlan(level, goal, category, equipment));
    setLoading(false);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <Text style={[styles.title, { color: theme.colors.black }]}>
            Generate Your Workout Plan
          </Text>
          <Input
            style={styles.input}
            label="Enter your goal"
            placeholder="e.g weight loss, muscle gain"
            value={goal}
            onChangeText={setGoal}
          />

          <Text style={{ color: theme.colors.black }}>Workout Category</Text>
          <View style={{ flexDirection: "row" }}>
            <CheckBox
              containerStyle={{ width: "35%" }}
              checked={category == "Strength"}
              title={"Strength"}
              onIconPress={() => setCategory("Strength")}
            />
            <CheckBox
              checked={category == "Cardio"}
              title={"Cardio"}
              onIconPress={() => setCategory("Cardio")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <CheckBox
              containerStyle={{ width: "35%" }}
              checked={category == "Plyometrics"}
              title={"Plyometrics"}
              onIconPress={() => setCategory("Plyometrics")}
            />
            <CheckBox
              checked={category == "Powerlifting"}
              title={"Powerlifting"}
              onIconPress={() => setCategory("Powerlifting")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <CheckBox
              containerStyle={{ width: "35%" }}
              checked={category == "Strongman"}
              title={"Strongman"}
              onIconPress={() => setCategory("Strongman")}
            />
            <CheckBox
              checked={category == "Stretching"}
              title={"Stretching"}
              onIconPress={() => setCategory("Stretching")}
            />
          </View>
          <CheckBox
            checked={category == "Olympic Weightlifting"}
            title={"Olympic Weightlifting"}
            onIconPress={() => setCategory("Olympic Weightlifting")}
          />
          <Input
            style={styles.input}
            label="Fitness Level"
            placeholder="e.g. beginner, intermediate, advanced"
            value={level}
            onChangeText={setLevel}
          />

          <Text style={{ color: theme.colors.black }}>Available Equipment</Text>

          <View
            style={{
              flexDirection: "row",
            }}
          >
            <CheckBox
              containerStyle={{ width: "35%" }}
              checked={equipment == "Only Weights"}
              title={"Only Weights"}
              onIconPress={() => setEquipment("Only Weights")}
            />
            <CheckBox
              checked={equipment == "Weights and Machines"}
              title={"Weights and Machines"}
              onIconPress={() => setEquipment("Weights and Machines")}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
            }}
          >
            <CheckBox
              containerStyle={{ width: "35%" }}
              checked={equipment == "Full Gym"}
              title={"Full Gym"}
              onIconPress={() => setEquipment("Full Gym")}
            />
            <CheckBox
              checked={equipment == "None"}
              title={"None"}
              onIconPress={() => setEquipment("None")}
            />
          </View>
          <Button
            disabled={
              goal && category && level && equipment && !loading ? false : true
            }
            title="Generate Plan"
            onPress={handleGeneratePlan}
            loading={loading}
          />
          {plan && (
            <View style={styles.planContainer}>
              <Text style={styles.planTitle}>Your Plan:</Text>
              {plan.exercises.map((item, index) => (
                <Text key={index}>{item.id}</Text>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 20 },
  planContainer: { marginTop: 20 },
  planTitle: { fontSize: 18, fontWeight: "bold" },
});