import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Button, Dimensions } from "react-native";
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

export default function Home() {
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
    setShowPlaceResultPage(true);
  }, [searchedPlaces, searchKeyword]);


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

    const places = data.map((place: any) =>
      Place.fromAPIResponse(place)
    );
    setPlaces(places);
    console.log(places);
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

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <View style={styles.topBannerContainer}>
          <TopBanner toggleUserProfile={toggleUserProfile} backToHome={backToHome}/>
        </View>
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
        <View style={styles.searchBarContainer}>
          <Searchbar setSearchedPlaces={setSearchedPlaces} setSearchKeyword={setSearchKeyword} />
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

      

        {/* Place Detail Modal */}
      {/* <SlideUpModal
        visible={showPlaceDetail}
        onClose={() => setShowPlaceDetail(false)}
        backgroundColor={colors.secondaryColor} // Optional: default is white
        backdropOpacity={0} // Optional: default is 0.5
      > */}
        {/* <PlaceReview place={selectedPlace!} /> */}
        {/* <View style={styles.placePreviewContainer}>
          <PlacePreview place={selectedPlace!} />
        </View>
      </SlideUpModal> */}

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
    position: "absolute",
    zIndex: 1000,
    top: 0,
    width: "100%",
    height: Dimensions.get("window").height * 0.10,
    flex: 1,
  },
  searchBarContainer: {
    position: "absolute",
    top: Dimensions.get("window").height * 0.15,
    width: "80%",
    height: 50,
  },
  placePreviewContainer: {
    width: "100%",
    height: Dimensions.get("window").height * 0.3,
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
});
