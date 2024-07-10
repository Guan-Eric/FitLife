export interface User {
  username: string;
  name: string;
  bio: string;
  id: string;
  email: string;
  height: string;
  weight: string;
  metricUnits: boolean;
  darkMode: boolean;
}

export interface Post {
  id: string;
  url: string;
  userId: string;
  caption: string;
  userName: string;
  like: boolean;
  numLikes: number;
  workoutId: string;
  date: string;
}

export interface Plan {
  id: string;
  name: string;
  days: Day[];
}

export interface Day {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Workout {
  id: string;
  name: string;
  duration: number;
  date: string;
  exercises: Exercise[];
}

export interface Exercise {
  instructions: string[];
  secondaryMuscles: string[];
  id: string;
  name: string;
  sets: Set[];
  cardio: boolean;
  category: string;
  equipment: string;
  level: string;
}

export interface Set {
  reps: number;
  weight_duration: number;
}
