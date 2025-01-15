import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Exercise } from "../../../components/types";
import { Button, Input } from "@rneui/themed";
import { fetchSuggestions } from "../../../backend/ai";

export default function SuggestExerciseScreen() {
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const [bodyPart, setBodyPart] = useState<string>("");
  const [preference, setPreference] = useState<string>("");

  const handleSuggestExercises = async () => {
    setSuggestions(await fetchSuggestions(bodyPart, preference));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise Suggestions</Text>
      <Input
        style={styles.input}
        label="Enter body part"
        placeholder="e.g. legs, arms"
        value={bodyPart}
        onChangeText={setBodyPart}
      />
      <Input
        style={styles.input}
        label="Enter your exercise preference"
        placeholder="e.g. cardio, strength, flexibility"
        value={preference}
        onChangeText={setPreference}
      />
      <Button
        disabled={bodyPart && preference ? false : true}
        title="Get Suggestions"
        onPress={handleSuggestExercises}
      />
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 20 },
});