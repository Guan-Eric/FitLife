import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Appearance,
  ScrollView,
} from "react-native";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIRESTORE_DB } from "../firebaseConfig";
import {
  updateDoc,
  getDoc,
  doc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

function ViewPlanScreen({ route, navigation }) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState({});
  const [days, setDays] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isMetric, setIsMetric] = useState();

  useEffect(() => {
    if (isDirty) {
      handleSavePlan();
      setIsDirty(false);
    }
  }, [name, days, isDirty]);

  useEffect(() => {
    const fetchPlanFromFirestore = async () => {
      try {
        const userDoc = await getDoc(
          doc(FIRESTORE_DB, `Users/${route.params.userId}`)
        );
        const userData = userDoc.data();
        setIsMetric(userData.metricUnits);
        const planDoc = await getDoc(
          doc(
            FIRESTORE_DB,
            `Users/${route.params.userId}/Plans/${route.params.planId}`
          )
        );
        const planData = planDoc.data();
        setPlan(planData);
        setName(planData.name);

        const daysCollection = collection(planDoc.ref, "Days");
        const daysSnapshot = await getDocs(daysCollection);
        const daysData = [];

        for (const dayDoc of daysSnapshot.docs) {
          const dayData = dayDoc.data();

          const exercisesCollection = collection(dayDoc.ref, "Exercise");
          const exercisesSnapshot = await getDocs(exercisesCollection);
          const exercisesData = exercisesSnapshot.docs.map((exerciseDoc) =>
            exerciseDoc.data()
          );
          dayData.exercises = exercisesData;
          daysData.push(dayData);
        }
        setDays(daysData);
      } catch (error) {
        console.error("Error fetching plan data:", error);
      }
    };

    fetchPlanFromFirestore();
  }, []);
  const setNameAndSave = (newName) => {
    setName(newName);
    setIsDirty(true);
  };
  const handleSavePlan = async () => {
    const planDocRef = doc(
      FIRESTORE_DB,
      `Users/${route.params.userId}/Plans/${route.params.planId}`
    );
    updateDoc(planDocRef, { name: name });
    for (const day of days) {
      const dayDocRef = doc(planDocRef, `Days/${day.id}`);
      await updateDoc(dayDocRef, { name: day.name });

      for (const exercise of day.exercises) {
        const exerciseDocRef = doc(dayDocRef, `Exercise/${exercise.id}`);
        await updateDoc(exerciseDocRef, {
          name: exercise.name,
          sets: exercise.sets,
        });
      }
    }
  };
  const handleAddDay = async () => {
    try {
      const planDoc = doc(
        FIRESTORE_DB,
        `Users/${route.params.userId}/Plans/${route.params.planId}`
      );
      const daysCollection = collection(planDoc, "Days");
      const daysDocRef = await addDoc(daysCollection, {
        name: "New Day",
        planId: route.params.planId,
      });
      const dayDoc = doc(daysCollection, daysDocRef.id);
      await updateDoc(dayDoc, { id: daysDocRef.id });
      const newDayDoc = await getDoc(doc(daysCollection, daysDocRef.id));
      const newDayData = newDayDoc.data();

      setDays((prevDays) => [...prevDays, newDayData]);
      setIsDirty(true);
    } catch (error) {
      console.error("Error adding new day:", error);
    }
  };

  const handleAddSet = async (dayId, exerciseId, exercise, days) => {
    const exerciseDoc = doc(
      FIRESTORE_DB,
      `Users/${route.params.userId}/Plans/${route.params.planId}/Days/${dayId}/Exercise/${exerciseId}`
    );
    const exerciseDocSnap = await getDoc(exerciseDoc);

    if (exerciseDocSnap.exists()) {
      const currentSets = exerciseDocSnap.data().sets || [];
      const newSets = [...currentSets, { reps: 0, weight_duration: 0 }];
      await updateDoc(exerciseDoc, { sets: newSets });
      const updatedDays = days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((ex) =>
                ex.id === exerciseId ? { ...ex, sets: newSets } : ex
              ),
            }
          : day
      );
      setDays(updatedDays);
      setIsDirty(true);
    }
  };

  const handleDeleteDay = async (dayId) => {
    try {
      const dayDocRef = doc(
        FIRESTORE_DB,
        `Users/${route.params.userId}/Plans/${route.params.planId}/Days/${dayId}`
      );
      const exercisesCollectionRef = collection(dayDocRef, "Exercise");
      const exercisesQuerySnapshot = await getDocs(exercisesCollectionRef);

      exercisesQuerySnapshot.forEach(async (exerciseDoc) => {
        await deleteDoc(exerciseDoc.ref);
      });
      await deleteDoc(dayDocRef);
      setDays((prevDays) => prevDays.filter((day) => day.id !== dayId));
      setIsDirty(true);
    } catch (error) {
      console.error("Error deleting day:", error);
    }
  };
  const handleDeleteExercise = async (dayId, exerciseId) => {
    try {
      const exerciseDocRef = doc(
        FIRESTORE_DB,
        `Users/${route.params.userId}/Plans/${route.params.planId}/Days/${dayId}/Exercise/${exerciseId}`
      );
      await deleteDoc(exerciseDocRef);
      setDays((prevDays) =>
        prevDays.map((prevDay) =>
          prevDay.id === dayId
            ? {
                ...prevDay,
                exercises: prevDay.exercises.filter(
                  (exercise) => exercise.id !== exerciseId
                ),
              }
            : prevDay
        )
      );
      setIsDirty(true);
    } catch (error) {
      console.error("Error deleting exercise:", error);
    }
  };
  const handleDeleteSet = (dayIndex, exerciseIndex, setIndex) => {
    setDays((prevDays) =>
      prevDays.map((prevDay, dIndex) =>
        dIndex === dayIndex
          ? {
              ...prevDay,
              exercises: prevDay.exercises.map((prevExercise, eIndex) =>
                eIndex === exerciseIndex
                  ? {
                      ...prevExercise,
                      sets: prevExercise.sets.filter(
                        (set, sIndex) => sIndex !== setIndex
                      ),
                    }
                  : prevExercise
              ),
            }
          : prevDay
      )
    );
    setIsDirty(true);
  };
  const updateSets = (dayIndex, exerciseIndex, setIndex, property, value) => {
    setDays((prevDays) =>
      prevDays.map((prevDay, dIndex) =>
        dIndex === dayIndex
          ? {
              ...prevDay,
              exercises: prevDay.exercises.map((prevExercise, eIndex) =>
                eIndex === exerciseIndex
                  ? {
                      ...prevExercise,
                      sets: prevExercise.sets.map((prevSet, sIndex) =>
                        sIndex === setIndex
                          ? { ...prevSet, [property]: value }
                          : prevSet
                      ),
                    }
                  : prevExercise
              ),
            }
          : prevDay
      )
    );
    setIsDirty(true);
  };
  const updateDayName = (dayIndex, newName) => {
    setDays((days) =>
      days.map((day, index) =>
        index === dayIndex ? { ...day, name: newName } : day
      )
    );
    setIsDirty(true);
  };
  const renderSetInputs = (sets, exerciseIndex, dayIndex, exercise) => {
    return (
      <View>
        <View style={styles.setRow}>
          {!exercise.cardio && (
            <View style={styles.setRow}>
              <Text style={styles.baseText}>Reps</Text>
              <Text style={styles.baseText}>Weight</Text>
            </View>
          )}
          {exercise.cardio && <Text style={styles.baseText}>Duration</Text>}
        </View>
        {sets.map((set, setIndex) => (
          <View key={setIndex} style={styles.setRow}>
            <Text style={styles.baseText}>{`Set ${setIndex + 1}`}</Text>
            {!exercise.cardio && (
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                onChangeText={(newReps) =>
                  updateSets(dayIndex, exerciseIndex, setIndex, "reps", newReps)
                }
                value={set.reps.toString()}
              />
            )}
            {!exercise.cardio && <Text>x</Text>}
            {!exercise.cardio && (
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                onChangeText={(newWeight) =>
                  updateSets(
                    dayIndex,
                    exerciseIndex,
                    setIndex,
                    "weight_duration",
                    newWeight
                  )
                }
                value={set.weight_duration.toString()}
              />
            )}
            {!exercise.cardio && <Text>{isMetric ? "kg" : "lbs"}</Text>}
            {exercise.cardio && (
              <TextInput
                keyboardType="numeric"
                style={styles.input}
                onChangeText={(newDuration) =>
                  updateSets(
                    dayIndex,
                    exerciseIndex,
                    setIndex,
                    "weight_duration",
                    newDuration
                  )
                }
                value={set.weight_duration.toString()}
              />
            )}
            <Button
              title="Delete Set"
              onPress={() => handleDeleteSet(dayIndex, exerciseIndex, setIndex)}
            />
          </View>
        ))}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.baseText}>Name</Text>
        <TextInput
          style={styles.input}
          onChangeText={(newName) => setNameAndSave(newName)}
          value={name}
        />
        <ScrollView>
          {days.map((day, dayIndex) => (
            <View key={day.id}>
              <Text style={styles.titleText}>{day.name}</Text>
              <TextInput
                style={styles.input}
                onChangeText={(newDayName) =>
                  updateDayName(dayIndex, newDayName)
                }
                value={day.name}
              />
              {day.exercises &&
                day.exercises.map((exercise, exerciseIndex) => (
                  <View key={exercise.id}>
                    <Text style={styles.baseText}>{exercise.name}</Text>
                    <Button
                      title="Delete Exercise"
                      onPress={() => handleDeleteExercise(day.id, exercise.id)}
                    />
                    {renderSetInputs(
                      exercise.sets,
                      exerciseIndex,
                      dayIndex,
                      exercise
                    )}
                    <Button
                      title={"Add Set"}
                      onPress={() =>
                        handleAddSet(day.id, exercise.id, exercise, days)
                      }
                    />
                  </View>
                ))}
              <Button
                title="Add Exercise"
                onPress={() =>
                  navigation.navigate("SearchExercise", {
                    userId: route.params.userId,
                    dayId: day.id,
                    planId: route.params.planId,
                  })
                }
              />
              <Button
                title="Delete Day"
                onPress={() => handleDeleteDay(day.id)}
              />
            </View>
          ))}
          <Button title="Add Day" onPress={handleAddDay} />
        </ScrollView>
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
export default ViewPlanScreen;