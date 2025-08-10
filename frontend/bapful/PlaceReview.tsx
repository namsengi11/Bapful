import { View, Text, StyleSheet } from "react-native";
import { Place } from "./Place";
import UserProfileList from "./UserProfileList";
import { useState } from "react";
import { Reviewer } from "./Reviewer";

export default function PlaceReview({ place }: { place: Place }) {
  console.log(place);
  const [selectedUser, setSelectedUser] = useState<Reviewer | null>(null);

  // Sample user data - in a real app, this would come from your backend
  const sampleUsers = [
    new Reviewer({
      id: 1,
      name: "김민수",
      profileImage: "https://i.pravatar.cc/100?img=1",
      review: "사장님이 맛있고 음식이 친절해요",
    }),
    new Reviewer({
      id: 2,
      name: "이영희",
      profileImage: "https://i.pravatar.cc/100?img=2",
      review: "인생맛집이에요",
    }),
    new Reviewer({
      id: 3,
      name: "박철수",
      profileImage: "https://i.pravatar.cc/100?img=3",
      review: "사장님이 맛있고 음식이 친절해요",
    }),
    new Reviewer({
      id: 4,
      name: "정수연",
      profileImage: "https://i.pravatar.cc/100?img=4",
      review: "인생맛집이에요",
    }),
    new Reviewer({
      id: 5,
      name: "최동훈",
      profileImage: "https://i.pravatar.cc/100?img=5",
      review: "인생맛집이에요",
    }),
  ];

  const handleUserPress = (user: Reviewer) => {
    console.log("User pressed:", user.name);
    setSelectedUser(user);
  };

  return (
    <View style={styles.container}>
      <View style={styles.description}>
        <Text style={styles.titleText}>Description</Text>
        <Text style={styles.descriptionText}>{place.name}</Text>
        <Text style={styles.descriptionText}>{place.address}</Text>
        <Text style={styles.descriptionText}>{place.description}</Text>
      </View>
      <View style={styles.otherReviewers}>
        <Text style={styles.titleText}>Other Reviewers</Text>
        <UserProfileList users={sampleUsers} onUserPress={handleUserPress} />
      </View>
      <View style={styles.otherReviews}>
        <Text style={styles.titleText}>Other Reviews</Text>
        <Text style={styles.descriptionText}>{selectedUser?.review}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  description: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  otherReviewers: {
    flex: 0.5,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "gray",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    width: "100%",
    padding: 10,
  },
  otherReviews: {
    flex: 1,
    alignItems: "center",
    width: "100%",
    padding: 10,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
});
