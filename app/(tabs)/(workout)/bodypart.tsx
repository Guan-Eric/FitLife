import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIRESTORE_DB, FIREBASE_STR } from "../../../firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Exercise } from "../../../components/types";
import { Href, router, useLocalSearchParams } from "expo-router";
import { Card, useTheme } from "@rneui/themed";
import { ScreenWidth } from "@rneui/base";

const screenWidth = Dimensions.get("window").width;

function BodyPartScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [imageUrls, setImageUrls] = useState({});
  const { bodypart, route, planId, dayId } = useLocalSearchParams();

  const bodyPartQuery = (bodypart as string)?.toLowerCase();

  const fetchExercisesFromFirestore = async () => {
    try {
      const collectionRef = collection(FIRESTORE_DB, "Exercises");
      const queryRef = query(
        collectionRef,
        where("primaryMuscles", "array-contains", bodyPartQuery)
      );
      const querySnapshot = await getDocs(queryRef);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
        fetchImage(doc.data().id);
      });
      setExercises(data);
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    }
  };

  const fetchImage = async (id) => {
    try {
      const imageRef = ref(FIREBASE_STR, `assets/${id}_0.jpg`);
      const url = await getDownloadURL(imageRef);
      setImageUrls((prevImageUrls) => ({
        ...prevImageUrls,
        [id]: url,
      }));
    } catch (error) {
      console.error("Error getting image URL:", error);
    }
  };

  useEffect(() => {
    fetchExercisesFromFirestore();
  }, []);

  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView>
        <Text style={[styles.title, { color: theme.colors.black }]}>
          {bodypart}
        </Text>
        <FlatList
          data={exercises}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/(workout)/exercise",
                  params: {
                    exerciseId: item.id,
                    planId: planId,
                    dayId: dayId,
                    route: route,
                  },
                } as Href<string>)
              }
            >
              <Image
                source={{ uri: imageUrls[item.id] }}
                style={{
                  alignSelf: "center",
                  width: ScreenWidth,
                  height: ScreenWidth / (195 / 130),
                  resizeMode: "cover",
                }}
              />
              <Text style={[styles.baseText, { color: theme.colors.black }]}>
                {item.name}
              </Text>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  baseText: {
    paddingTop: 20,
    fontSize: 20,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
  },
  card: {
    padding: 20,
    borderRadius: 20,
  },
  image: {
    borderRadius: 8,
    width: screenWidth * 0.82,
    height: screenWidth * 0.82 * 0.75,
    alignSelf: "center",
    resizeMode: "cover",
  },
});

export default BodyPartScreen;
