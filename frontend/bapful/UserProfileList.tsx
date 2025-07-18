import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Reviewer } from "./Reviewer";

const { width: screenWidth } = Dimensions.get("window");

type UserProfileListProps = {
  users: Reviewer[];
  onUserPress?: (user: Reviewer) => void;
};

export default function UserProfileList({
  users,
  onUserPress,
}: UserProfileListProps) {
  const handleUserPress = (user: Reviewer) => {
    if (onUserPress) {
      onUserPress(user);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        decelerationRate="fast"
        snapToInterval={80} // Snap to each profile item
        snapToAlignment="start"
      >
        {users.map((user, index) => (
          <TouchableOpacity
            key={user.id}
            style={[
              styles.profileItem,
              index === 0 && styles.firstItem,
              index === users.length - 1 && styles.lastItem,
            ]}
            onPress={() => handleUserPress(user)}
            activeOpacity={0.7}
          >
            <View style={styles.imageContainer}>
              <Image
                source={
                  typeof user.profileImage === "string" &&
                  user.profileImage.startsWith("http")
                    ? { uri: user.profileImage }
                    : require("./assets/icon.png") // Fallback to local image
                }
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {user.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 20,
    color: "#333",
  },
  scrollContainer: {},
  profileItem: {
    alignItems: "center",
    marginRight: 16,
    width: 70,
  },
  firstItem: {
    marginLeft: 0,
  },
  lastItem: {
    marginRight: 20,
  },
  imageContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  userName: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
});
