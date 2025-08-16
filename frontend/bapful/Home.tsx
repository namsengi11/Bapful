import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Button, Dimensions, TouchableOpacity } from "react-native";
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import KakaoMap from "./Kakaomap";
import SlideUpModal from "./SlideUpModal";
import UserProfileList from "./UserProfileList";
import PlaceReview from "./PlaceReview";
import TopBanner from "./TopBanner";
import colors from "./colors";
import Searchbar from "./Searchbar";
import PlaceResultPage from "./PlaceResultPage";
import PlacePreview from "./PlacePreview";
import { Place } from "./Place";

interface HomeProps { onShowRecommendations?: () => void }

export default function Home({ onShowRecommendations }: HomeProps) {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(
    null
  );
  const [showPlaceDetail, setShowPlaceDetail] = useState<boolean>(false);

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchedPlaces, setSearchedPlaces] = useState<Place[]>([]);
  const [showPlaceResultPage, setShowPlaceResultPage] = useState<boolean>(false);

  const map_rest_api_key = process.env.EXPO_PUBLIC_REST_API_KEY;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    getNearbyTourism();
  }, [currentLocation]);

  useEffect(() => {
    setShowPlaceResultPage(true);
  }, [searchedPlaces, searchKeyword]);

  const getCurrentLocation = async () => {
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("위치 권한이 거절되었습니다.");
      return;
    }

    // 현재 위치 가져오기
    try {
      const { coords } = await getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      console.error("위치 정보를 가져오는 데 실패했습니다:", error);
    }
    setCurrentLocation({ latitude: 37.593371, longitude: 127.01673 });
  };

  const getNearbyTourism = async () => {
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=관광지&x=${currentLocation?.longitude}&y=${currentLocation?.latitude}&radius=2000`,
      {
        headers: {
          Authorization: `KakaoAK ${map_rest_api_key}`,
        },
      }
    );
    const data = await response.json();

    // Map data to KakaoMapPlace[]
    console.log(data.documents);
    const places = data.documents.map((place: any) =>
      Place.fromKakaoAPIResponse(place)
    );
    console.log(places);
    setPlaces(places);
  };

  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setShowPlaceDetail(true);
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <View style={styles.topBannerContainer}>
          <TopBanner />
        </View>
        <View style={styles.searchBarContainer}>
          <Searchbar setSearchedPlaces={setSearchedPlaces} setSearchKeyword={setSearchKeyword} />
        </View>
        <View style={styles.mapContainer}>
          {currentLocation ? (
            <KakaoMap
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              places={places}
              onPlaceClick={handlePlaceClick}
            />
          ) : (
            <Text>위치를 가져오는 중입니다...</Text>
          )}
        </View>

      </View>
      {onShowRecommendations && (
        <TouchableOpacity style={styles.recommendButton} onPress={onShowRecommendations}>
          <Text style={styles.recommendButtonText}>추천 보기</Text>
        </TouchableOpacity>
      )}
        {/* Place Detail Modal */}
        <SlideUpModal
          visible={showPlaceDetail}
          onClose={() => setShowPlaceDetail(false)}
          backgroundColor={colors.secondaryColor} // Optional: default is white
          backdropOpacity={0} // Optional: default is 0.5
        >
          {/* <PlaceReview place={selectedPlace!} /> */}
          <View style={styles.placePreviewContainer}>
            <PlacePreview place={selectedPlace!} />
          </View>
        </SlideUpModal>

        {/* Search Result Modal */}
        <SlideUpModal
          visible={showPlaceResultPage}
          onClose={() => setShowPlaceResultPage(false)}
          backgroundColor={colors.secondaryColor} // Optional: default is white
          backdropOpacity={0.3} // Optional: default is 0.5
        >
          <PlaceResultPage searchKeyword={searchKeyword} searchedPlaces={searchedPlaces} />
        </SlideUpModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  mapContainer: {
    flex: 8,
  },
  topBannerContainer: {
    width: "100%",
    flex: 1,
  },
  searchBarContainer: {
    position: "absolute",
    top: Dimensions.get("window").height * 0.15,
    width: "80%",
    height: 50,

    zIndex: 1000,
  },
  placePreviewContainer: {
    width: "100%",
    height: Dimensions.get("window").height * 0.3,
  },
  recommendButton: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: colors.primaryColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
  },
  recommendButtonText: {
    color: '#4a2d00',
    fontWeight: '600'
  }
});
