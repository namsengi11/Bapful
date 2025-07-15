import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import KakaoMap from "./Kakaomap";
import { KakaoMapPlace } from "./Kakaomap_place";

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [places, setPlaces] = useState<KakaoMapPlace[]>([]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.text}>Bapful</Text>
        </View>
        {currentLocation ? (
          <KakaoMap
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            places={places}
          />
        ) : (
          <Text>위치를 가져오는 중입니다...</Text>
        )}
      </View>
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
});
