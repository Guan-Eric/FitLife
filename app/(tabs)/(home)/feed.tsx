import React, { useCallback, useEffect, useState } from "react";
import { FlatList, View, StyleSheet, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FIREBASE_AUTH } from "../../../firebaseConfig";
import { Icon, useTheme, Button, Tooltip } from "@rneui/themed";
import { getFeed, toggleLike } from "../../../backend/post";
import PostItem from "../../../components/PostItem";
import { Post } from "../../../components/types";
import { router, useFocusEffect } from "expo-router";
import { usePushNotifications } from "../../../components/usePushNotifications";
import {
  endStreak,
  fetchCurrentStreak,
  fetchLongestStreak,
  savePushToken,
  updateStreakResetDate,
} from "../../../backend/user";
import FeedLoader from "../../../components/FeedLoader";
import { fetchStreakResetDate } from "../../../backend/user";
import StreakResetModal from "../../../components/StreakLossModal";
import { AdMobBanner } from "expo-ads-admob";
import Constants from "expo-constants";

const FeedScreen: React.FC = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [streakResetModalVisible, setStreakResetModalVisible] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [openToolTip, setOpenToolTip] = useState(false);

  const {
    expoPushToken,
    notification,
    hasNewNotification,
    markNotificationsAsRead,
  } = usePushNotifications();
  const AD_POSITION_INTERVAL = 5;

  async function fetchFeed() {
    try {
      const feed = await getFeed();
      setPosts(feed);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFeed();
    checkStreakStatus();
    getStreakInformation();
  }, []);

  useEffect(() => {
    if (expoPushToken) {
      savePushToken(expoPushToken.data);
    }
  }, [expoPushToken]);

  useFocusEffect(
    useCallback(() => {
      fetchFeed();
      getStreakInformation();
    }, [])
  );

  const navigateProfile = (id: string) => {
    if (id === FIREBASE_AUTH.currentUser?.uid) {
      router.push("/(tabs)/(profile)/user");
    } else {
      router.push({
        pathname: "/(tabs)/(home)/profile",
        params: { userId: id },
      });
    }
  };

  const handleToggleLike = async (post: Post) => {
    const updatedPost = await toggleLike(post);
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const navigateToNotifications = () => {
    markNotificationsAsRead();
    router.push({
      pathname: "/(tabs)/(home)/notification",
    });
  };

  const checkStreakStatus = async () => {
    const resetDate = await fetchStreakResetDate();
    if (resetDate) {
      const currentDate = new Date();
      const currentStreak = await fetchCurrentStreak();
      if (currentDate > resetDate && currentStreak > 0) {
        setStreakResetModalVisible(true);
      }
    }
  };

  const getStreakInformation = async () => {
    setCurrentStreak(await fetchCurrentStreak());
    setLongestStreak(await fetchLongestStreak());
  };

  const handleContinueStreak = () => {
    updateStreakResetDate();
    setStreakResetModalVisible(false);
  };

  const handleNewStreak = () => {
    endStreak();
    setStreakResetModalVisible(false);
  };

  const renderItem = ({ item, index }) => {
    if ((index + 1) % AD_POSITION_INTERVAL === 0) {
      return (
        <View style={{ marginVertical: 10 }}>
          {/* <AdMobBanner
            bannerSize="mediumRectangle"
            adUnitID={
              Platform.OS === "ios"
                ? Constants.expoConfig?.extra?.admobIOSFeedUnitId
                : Constants.expoConfig?.extra?.admobAndroidFeedUnitId
            }
            onDidFailToReceiveAdWithError={(error) => console.error(error)}
          /> */}
        </View>
      );
    }
    return (
      <PostItem
        post={item}
        theme={theme}
        navigateProfile={navigateProfile}
        onToggleLike={() => handleToggleLike(item)}
        renderComments={false}
        showUser={true}
        tab={"(home)"}
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            paddingLeft: 25,
            paddingRight: 10,
            paddingBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={[styles.title, { color: theme.colors.black }]}>
            Feed
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Tooltip
              visible={openToolTip}
              onOpen={() => setOpenToolTip(true)}
              onClose={() => setOpenToolTip(false)}
              popover={
                <>
                  <Text style={{ color: theme.colors.grey0 }}>
                    Current Streak: {currentStreak}
                  </Text>
                  <Text style={{ color: theme.colors.grey0 }}>
                    Longest Streak: {longestStreak}
                  </Text>
                </>
              }
            >
              <Button type="clear" onPress={() => setOpenToolTip(true)}>
                <Image
                  source={require("../../../assets/fire.png")}
                  style={{ width: 32, height: 32 }}
                />
              </Button>
            </Tooltip>
            <Button type="clear" onPress={navigateToNotifications}>
              {hasNewNotification ? (
                <Icon size={32} name="bell-badge" type="material-community" />
              ) : (
                <Icon size={32} name="bell" type="material-community" />
              )}
            </Button>
            <Button
              type="clear"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/(home)/search",
                })
              }
            >
              <Icon size={32} name="magnify" type="material-community" />
            </Button>
          </View>
        </View>
        {loading ? (
          <View style={{ alignItems: "center" }}>
            <FeedLoader theme={theme} />
            <FeedLoader theme={theme} />
          </View>
        ) : (
          <FlatList
            numColumns={1}
            horizontal={false}
            data={posts}
            renderItem={renderItem}
          />
        )}
        <StreakResetModal
          modalVisible={streakResetModalVisible}
          onClose={() => setStreakResetModalVisible(false)}
          onContinueStreak={handleContinueStreak}
          onNewStreak={handleNewStreak}
          theme={theme}
        />
      </SafeAreaView>
    </View>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: "Lato_700Bold",
    fontSize: 32,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalSubText: {
    fontSize: 14,
    marginVertical: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "column",
    width: "100%",
  },
  continueButton: {
    backgroundColor: "#27ae60",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  newStreakButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
