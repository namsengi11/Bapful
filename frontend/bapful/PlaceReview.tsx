import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import { Place } from "./Place";
import colors from "./colors";

export default function PlaceReview({ place, onBack }: { place: Place, onBack?: () => void }) {
  console.log(place);

<<<<<<< HEAD
  // Sample user data - in a real app, this would come from your backend
  const reviewers: Reviewer[] = [];
=======
  // Sample review data - in a real app, this would come from your backend
  const sampleReviews = [
    {
      id: 1,
      user: "김민수",
      profileImage: "https://i.pravatar.cc/100?img=1",
      rating: 5,
      comment: "사장님이 맛있고 음식이 친절해요. 정말 맛있는 곳이에요!",
      date: "2024.08.20",
      likes: 12,
      comments: 3,
    },
    {
      id: 2,
      user: "이영희",
      profileImage: "https://i.pravatar.cc/100?img=2",
      rating: 4,
      comment: "인생맛집이에요. 재방문 의사 100%입니다.",
      date: "2024.08.18",
      likes: 8,
      comments: 1,
    },
    {
      id: 3,
      user: "박철수",
      profileImage: "https://i.pravatar.cc/100?img=3",
      rating: 5,
      comment: "음식이 정말 맛있어요. 분위기도 좋고 서비스도 만족스럽습니다.",
      date: "2024.08.15",
      likes: 15,
      comments: 5,
    },
    {
      id: 4,
      user: "정수연",
      profileImage: "https://i.pravatar.cc/100?img=4",
      rating: 4,
      comment: "가격대비 훌륭한 맛집입니다. 추천해요!",
      date: "2024.08.12",
      likes: 6,
      comments: 2,
    },
    {
      id: 5,
      user: "최동훈",
      profileImage: "https://i.pravatar.cc/100?img=5",
      rating: 5,
      comment: "완전 맛있어요! 다음에 또 올게요.",
      date: "2024.08.10",
      likes: 9,
      comments: 4,
    },
  ];
>>>>>>> 0a6399f876d7ccab00948fbd632584db677ba8ae

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text key={index} style={styles.star}>
        {index < rating ? '★' : '☆'}
      </Text>
    ));
  };

  const renderReviewItem = ({ item }: { item: any }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        <View style={styles.reviewUserInfo}>
          <Text style={styles.userName}>{item.user}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>{item.date}</Text>
        <View style={styles.reviewActions}>
          <Text style={styles.actionText}>👍 {item.likes}</Text>
          <Text style={styles.actionText}>💬 {item.comments}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>리뷰 목록</Text>
        <View style={styles.placeholder} />
      </View>
<<<<<<< HEAD
      <View style={styles.otherReviewers}>
        <Text style={styles.titleText}>Other Reviewers</Text>
        <UserProfileList users={reviewers} onUserPress={handleUserPress} />
      </View>
      <View style={styles.otherReviews}>
        <Text style={styles.titleText}>Other Reviews</Text>
        <Text style={styles.descriptionText}>{selectedUser?.review}</Text>
=======

      {/* Place Info */}
      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.placeAddress}>{place.address}</Text>
        <View style={styles.placeRatingContainer}>
          <Text style={styles.placeRating}>⭐ {place.rating || 4.5}</Text>
          <Text style={styles.placeReviewCount}>(리뷰 {sampleReviews.length}개)</Text>
        </View>
>>>>>>> 0a6399f876d7ccab00948fbd632584db677ba8ae
      </View>

      {/* Write Review Button */}
      <TouchableOpacity style={styles.writeReviewButton}>
        <Text style={styles.writeReviewText}> 리뷰 작성하기</Text>
      </TouchableOpacity>

      {/* Reviews List */}
      <FlatList
        data={sampleReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.reviewsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primaryColor,
    borderBottomWidth: 1,
    borderBottomColor: colors.brightBorder,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#4a2d00',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a2d00',
  },
  placeholder: {
    width: 40,
  },
  placeInfo: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.brightBorder,
  },
  placeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  placeRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeRating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  placeReviewCount: {
    fontSize: 14,
    color: colors.gray,
  },
  writeReviewButton: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.primaryColor,
    borderRadius: 8,
    alignItems: 'center',
  },
  writeReviewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a2d00',
  },
  reviewsList: {
    flex: 1,
  },
  reviewItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 14,
    color: '#FFD700',
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: colors.gray,
  },
  reviewActions: {
    flexDirection: 'row',
  },
  actionText: {
    fontSize: 12,
    color: colors.gray,
    marginLeft: 12,
  },
});
