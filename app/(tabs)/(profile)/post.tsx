import React, { useState, useEffect } from "react";
import {
  Button,
  View,
  StyleSheet,
  Pressable,
  Image,
  Text,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../../../firebaseConfig";
import { ActivityIndicator } from "react-native-paper";
import { useTheme, CheckBox, Icon, Input } from "@rneui/themed";
import {
  collection,
  updateDoc,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { ScreenWidth } from "@rneui/base";
import { Post } from "../../../components/types";
import { router, useLocalSearchParams } from "expo-router";
import {
  addComment,
  getUserPost,
  getUserPostComments,
  toggleLike,
} from "../../../backend/post";
import PostItem from "../../../components/PostItem";

function ViewPostScreen() {
  const { theme } = useTheme();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [post, setPost] = useState<Post>();

  const { userId, postId } = useLocalSearchParams();

  useEffect(() => {
    async function fetchUserPost() {
      try {
        setPost(await getUserPost(userId as string, postId as string));
        setComments(
          await getUserPostComments(userId as string, postId as string)
        );
      } catch (error) {
        console.error("Error fetching feed:", error);
      }
    }
    fetchUserPost();
  }, []);

  const navigateProfile = () => {
    if (post.userId == FIREBASE_AUTH.currentUser.uid) {
      router.push("/(tabs)/(profile)/user");
    } else {
      router.push({
        pathname: "/(tabs)/(profile)/profile",
        params: { userId: post.userId },
      });
    }
  };

  const handleToggleLike = async () => {
    setPost(await toggleLike(post));
  };

  const handleAddComment = async () => {
    if (post && comment) {
      await addComment(comment, post);
      setComments([...comments, { userName: "Current user", comment }]);
      setComment("");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaView>
        <ScrollView>
          {post && (
            <PostItem
              post={post}
              theme={theme}
              navigateProfile={navigateProfile}
              onToggleLike={handleToggleLike}
              showCommentIcon={false}
              showUser={true}
              tab={"(profile)"}
              viewPost={true}
              renderComments={() => (
                <>
                  {comments.map((item, index) => (
                    <View
                      key={index}
                      style={{ flexDirection: "row", paddingLeft: 15 }}
                    >
                      <Text
                        style={[
                          styles.commentUserName,
                          { color: theme.colors.black },
                        ]}
                      >
                        {item.userName}
                      </Text>
                      <Text
                        style={[styles.comment, { color: theme.colors.black }]}
                      >
                        {item.comment}
                      </Text>
                    </View>
                  ))}
                  <View
                    style={{
                      flexDirection: "row",
                      paddingLeft: 15,
                      paddingRight: 25,
                    }}
                  >
                    <Input
                      containerStyle={{ width: 300 }}
                      onChangeText={setComment}
                      value={comment}
                      placeholder="Comment here"
                      autoCapitalize="none"
                    />
                    <Button
                      disabled={comment === ""}
                      title="Post"
                      onPress={handleAddComment}
                    />
                  </View>
                </>
              )}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  userName: {
    fontFamily: "Lato_700Bold",
    fontSize: 16,
    paddingLeft: 10,
  },
  caption: {
    textAlign: "justify",
    fontFamily: "Lato_400Regular",
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 10,
    fontSize: 14,
  },
  comment: {
    textAlign: "justify",
    fontFamily: "Lato_400Regular",
    paddingLeft: 5,
    paddingRight: 25,
    fontSize: 16,
  },
  commentUserName: {
    fontFamily: "Lato_700Bold",
    paddingLeft: 25,
    fontSize: 16,
  },
});

export default ViewPostScreen;
