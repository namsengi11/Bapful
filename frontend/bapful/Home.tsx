import React, { useEffect, useState } from "react";
import './i18n'; // i18n 설정 import 추가
import { View, Text, StyleSheet, SafeAreaView, Button, TouchableOpacity } from "react-native";
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import KakaoMap from "./Kakaomap";
import { KakaoMapPlace } from "./Kakaomap_place";
import SlideUpModal from "./SlideUpModal";
import UserProfileList from "./UserProfileList";
import PlaceReview from "./PlaceReview";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home({ navigation }: { navigation: any }) {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [places, setPlaces] = useState<KakaoMapPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoMapPlace | null>(
    null
  );

  const map_rest_api_key = process.env.EXPO_PUBLIC_REST_API_KEY;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    getNearbyTourism();
  }, [currentLocation]);

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
    console.log("new");
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
    const places = data.documents.map((place: any) =>
      KakaoMapPlace.fromApiResponse(place)
    );
    setPlaces(places);
  };

  const handlePlaceClick = (place: KakaoMapPlace) => {
    setSelectedPlace(place);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Bapful</Text>
      </View>
      
      {/* RecommendPage 이동 버튼 추가 */}
      <View style={styles.mainActions}>
        <TouchableOpacity 
          style={styles.recommendButton} 
          onPress={() => navigation.navigate('RecommendPage')}
        >
          <Text style={styles.buttonText}>맛집 추천 보기</Text>
        </TouchableOpacity>
      </View>
      
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fd",
  },
  header: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 5,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
  },
  recommendButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
