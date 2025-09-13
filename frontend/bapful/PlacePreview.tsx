import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from "react-native";

import { Place } from "./Place";
import colors from "./colors";

export default function PlacePreview({place, onShowAllReviews}: {place: Place, onShowAllReviews?: () => void}) {
  return (
    <View style={styles.container}>

      <View style={styles.titleContainer}>
        <Image source={require("./assets/Tbk_king.png")} style={styles.placeRankImage} />
        <View style={{flex: 1}}>
          <Text style={styles.titleText}>{place.name}</Text>
        </View>
        <Image source={require("./assets/spoon_rating.png")} style={styles.placeRatingImage} />
        <Text style={styles.bodyText}>{place.rating}</Text>
        <Text style={styles.bodyText}> ({place.ratingCount})</Text>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.bodyText}>{place.description}</Text>
      </View>

      <View style={styles.imageSliderContainer}>

      </View>
      <View style={styles.reviewContainer}>

        {place.reviews.length > 0 && <View style={styles.userReviewContainer}>
          <Text style={styles.bodyText}>{place.reviews[0].user}</Text>
          <Image source={require("./assets/spoon_rating.png")} style={styles.userRatingImage} />
          <Text style={styles.bodyText}>{place.reviews[0].rating}</Text>
          <Text style={[styles.bodyText, {marginLeft: 10}]}>{place.reviews[0].comment}</Text>
        </View>
        }

        {place.reviews.length > 1 && (
        <View style={styles.userReviewContainer}>
          <Text style={styles.bodyText}>{place.reviews[1].user}</Text>
          <Image source={require("./assets/spoon_rating.png")} style={styles.userRatingImage} />
          <Text style={styles.bodyText}>{place.reviews[1].rating}</Text>
          <Text style={[styles.bodyText, {marginLeft: 10}]}>{place.reviews[1].comment}</Text>
        </View>
        )}

        {place.reviews.length > 0 && (
          <TouchableOpacity style={styles.showAllReviewsButton} onPress={onShowAllReviews}>
            <Text style={styles.showAllReviewsText}>
              리뷰 {place.reviews.length}개 모두 보기 {'>'}
            </Text>
          </TouchableOpacity>
        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    height: "100%",
    padding: 16,
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    height: "100%",
    marginLeft: 15,
  },
  imageSliderContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
    marginTop: 5,
    marginBottom: 5,
  },
  reviewContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    height: "100%",
    marginLeft: 15,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 5,
  },
  bodyText: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: "bold",
  },
  userReviewContainer: {
    flex: 1,
    flexDirection: "row",
  },
  placeRankImage: {
    width: 50,
    height: 50,
  },
  placeRatingImage: {
    width: 30,
    height: 30,
  },
  userRatingImage: {
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  showAllReviewsButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryColor,
    borderRadius: 20,
  },
  showAllReviewsText: {
    fontSize: 14,
    color: '#4a2d00',
    fontWeight: 'bold',
  },
});