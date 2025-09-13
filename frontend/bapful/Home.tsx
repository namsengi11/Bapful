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
import UserProfile from "./UserProfile";
import { Place } from "./Place";
import { User } from "./User";
import { searchLocations } from "./api";

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
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);

  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchedPlaces, setSearchedPlaces] = useState<Place[]>([]);
  const [showPlaceResultPage, setShowPlaceResultPage] = useState<boolean>(false);
  
  const [showUserProfile, setShowUserProfile] = useState<boolean>(false);
  const [showMyProfile, setShowMyProfile] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const map_rest_api_key = process.env.EXPO_PUBLIC_REST_API_KEY;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    getNearbyTourism();
  }, [currentLocation]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchKeyword.trim()) {
        setSearchedPlaces([]);
        setShowPlaceResultPage(false);
        return;
      }
      
      try {
        const response = await searchLocations(searchKeyword);
        setSearchedPlaces(response);
        setShowPlaceResultPage(true);
      } catch (error) {
        console.error("위치 정보를 가져오는 데 실패했습니다:", error);
        setSearchedPlaces([]);
        setShowPlaceResultPage(false);
      }
    };

    fetchSearchResults();
  }, [searchKeyword]);


  const backToHome = () => {
    setShowMyProfile(false);
    setShowUserProfile(false);
    setShowPlaceDetail(false);
    setShowPlaceResultPage(false);
  }
  
  const toggleUserProfile = () => {
    setShowMyProfile(!showMyProfile);
  }

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
      `http://bapful.sjnam.site/api/locations?lat=${currentLocation?.latitude}&lng=${currentLocation?.longitude}&radius=2000`
    );
    const data = await response.json();

    const places = data.map((place: any) => {
      const mappedPlace = Place.fromAPIResponse(place);
      // Add sample reviews for demonstration
      mappedPlace.reviews = [
        {
          user: "김민수",
          comment: "정말 맛있는 곳이에요!",
          rating: 5,
          date: "2024.08.20"
        },
        {
          user: "이영희", 
          comment: "인생맛집 발견!",
          rating: 4,
          date: "2024.08.18"
        }
      ];
      return mappedPlace;
    });
    
    setPlaces(places);
  };
  
  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setShowPlaceDetail(true);
  };
  
  const handleUserClick = (user: User) => {  
    setSelectedUser(user);
    setShowUserProfile(true);
  };
  
  const myUserInfo = new User({
    id: "1",
    name: "김민수",
    latitude: 37.4,
    longitude: 127.1,
    statusMessage: "I love food",
    backgroundImage: "./assets/backgrounds/namsan_tower.png",
    foodImages: ["./assets/foods/bossam.png", "./assets/foods/japchae.png", "./assets/foods/samgyetang.png", "./assets/foods/soondubu.png", "./assets/foods/tbk.png"],
  });

  const handleShowAllReviews = () => {
    setShowPlaceDetail(false);
    setShowAllReviews(true);
  };

  const handleBackFromReviews = () => {
    console.log("handleBackFromReviews");
    setShowAllReviews(false);
    setShowPlaceDetail(true);
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        {/* TopBanner - Fixed at top */}
        <View style={styles.topBannerContainer}>
          <TopBanner toggleUserProfile={toggleUserProfile} backToHome={backToHome}/>
        </View>
        
        {/* Main content area */}
        <View style={styles.contentContainer}>
          <View style={styles.mapContainer}>
            {currentLocation ? (
              <KakaoMap
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                places={places}
                onPlaceClick={handlePlaceClick}
                onUserClick={handleUserClick}
              />
            ) : (
              <Text>위치를 가져오는 중입니다...</Text>
            )}
          </View>
          
          {/* SearchBar - Absolute positioned over map */}
          <View style={styles.searchBarContainer}>
            <Searchbar setSearchedPlaces={setSearchedPlaces} setSearchKeyword={setSearchKeyword} />
          </View>
        </View>

      </View>
      
      {showMyProfile && 
        <View style={styles.userProfileContainer}>
          <UserProfile myProfile={true} user={myUserInfo} />
        </View>
      }

      {showUserProfile && 
        <View style={styles.userProfileContainer}>
          <UserProfile myProfile={false} user={selectedUser!} />
        </View>
      }

      {/* Search Result Modal */}
      <SlideUpModal
        visible={showPlaceResultPage}
        onClose={() => setShowPlaceResultPage(false)}
        backgroundColor={colors.secondaryColor} // Optional: default is white
        backdropOpacity={0.3} // Optional: default is 0.5
      >
        <PlaceResultPage searchKeyword={searchKeyword} searchedPlaces={searchedPlaces} />
      </SlideUpModal>
      
      {/* Recommendation Button */}
      {/* {onShowRecommendations && (
        <TouchableOpacity style={styles.recommendButton} onPress={onShowRecommendations}>
          <Text style={styles.recommendButtonText}>추천 보기</Text>
        </TouchableOpacity>
      )} */}

      {/* Place Detail Modal */}
      <SlideUpModal
        visible={showPlaceDetail}
        onClose={() => setShowPlaceDetail(false)}
        backgroundColor={colors.secondaryColor} // Optional: default is white
        backdropOpacity={0} // Optional: default is 0.5
      >
        <PlacePreview place={selectedPlace!} onShowAllReviews={handleShowAllReviews} />
      </SlideUpModal>

      {/* All Reviews Modal */}
      <SlideUpModal
        visible={showAllReviews}
        onClose={() => setShowAllReviews(false)}
        backgroundColor={colors.secondaryColor}
        backdropOpacity={0.3}
      >
        <PlaceReview place={selectedPlace!} onBack={handleBackFromReviews} />
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
    height: Dimensions.get("window").height * 0.10,
    width: "100%",
    zIndex: 1000,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  searchBarContainer: {
    position: "absolute",
    top: 20,
    left: "10%",
    width: "80%",
    height: 50,
    zIndex: 999,
  },
  userProfileContainer: {
    flex: 1,
    position: "absolute",
    top: Dimensions.get("window").height * 0.10,
    width: "100%",
    height: Dimensions.get("window").height * 0.90,
    justifyContent: 'center',
    alignItems: 'center',
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
