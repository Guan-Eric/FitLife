import React from "react";
import { View, Pressable, Image, Text, StyleSheet } from "react-native";
import { CheckBox, Icon } from "@rneui/themed";
import { ScreenWidth } from "@rneui/base";
import { router } from "expo-router";
import { toggleLike } from "../../../backend/post";

const PostItem = ({ item, theme, navigateProfile, setPosts, posts }) => {
  return (
    <View style={{ paddingBottom: 20 }}>
      <Pressable
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 5,
          paddingLeft: 30,
        }}
        onPress={() => navigateProfile(item.userId)}
      >
        <Image
          style={{ width: 40, height: 40 }}
          source={require("../../../assets/profile.png")}
        />
        <Text style={[styles.userName, { color: theme.colors.black }]}>
          {item.userName}
        </Text>
      </Pressable>
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(tabs)/(home)/post",
            params: {
              postId: item.id,
              userId: item.userId,
            },
          })
        }
      >
        <Image
          source={{ uri: item.url }}
          style={{
            alignSelf: "center",
            borderRadius: 15,
            width: 0.93 * ScreenWidth,
            height: 0.93 * ScreenWidth * 1.25,
            resizeMode: "cover",
          }}
        />
      </Pressable>
      <View
        style={{
          paddingLeft: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <CheckBox
          title={item.numLikes.toString()}
          checked={item.like}
          checkedIcon={
            <Icon
              size={28}
              name="arm-flex"
              type="material-community"
              color="#ffde34"
            />
          }
          uncheckedIcon={
            <Icon
              size={28}
              name="arm-flex-outline"
              type="material-community"
            />
          }
          onPress={async () => {
            const updatedPost = await toggleLike(item);
            setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
          }}
        />
        <Pressable
          style={{ paddingRight: 30 }}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/(home)/post",
              params: {
                postId: item.id,
                userId: item.userId,
              },
            })
          }
        >
          <Icon name="comment-outline" type="material-community" />
        </Pressable>
      </View>

      <Text style={[styles.caption, { color: theme.colors.black }]}>
        {item.caption}
      </Text>
    </View>
  );
};

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
    fontSize: 14,
  },
});

export default PostItem;
