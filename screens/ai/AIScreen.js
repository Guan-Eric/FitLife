import React from "react";
import {
  Text,
  View,
  SafeAreaView,
  Pressable,
  Appearance,
  Button,
} from "react-native";
import { StyleSheet } from "react-native";

function AIScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text>Create Your Plan with AI</Text>
        <Button
          title="Create Plan with AI"
          onPress={() => navigation.navigate("Gender")}
        />
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: "column",
  },
  baseText: {
    fontSize: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  logoText: {
    fontSize: 50,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
});
export default AIScreen;