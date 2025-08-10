// RecommendPage.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { KakaoMapPlace } from './Kakaomap_place';
import PlaceReview from './PlaceReview';

type CategoryData = {
  category: string;
  items: KakaoMapPlace[];
};

const RecommendPage = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<KakaoMapPlace | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 장소 기반 추천
        const res = await axios.get('http://127.0.0.1:8000/locations/');
        // 메뉴 기반 추천
        // const res = await axios.get('http://127.0.0.1:8000/menus/');

        const formattedData = res.data.map((section: any) => ({
          category: section.category,
          items: section.items.map((item: any) => KakaoMapPlace.fromApiResponse(item)),
        }));
        setData(formattedData);
      } catch (e) {
        console.error('Failed to fetch recommendations:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>사용자 프로필 (매운맛 중독자)</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.redBtn} onPress={() => {/* navigation.navigate('UserProfile') */}} />
          <TouchableOpacity style={styles.orangeBtn} disabled />
        </View>
      </View>

      {/* 유저 성향별 추천 리스트 */}
      <ScrollView>
        {data.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {section.items.map((place) => (
                <TouchableOpacity
                  key={`${place.x}-${place.y}`}
                  style={styles.imageBox}
                  onPress={() => setSelectedPlace(place)}
                >
                  <Image source={{ uri: place.place_url }} style={styles.image} />
                  <Text style={styles.placeName}>{place.place_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {/* 모달 상세 보기 */}
      <Modal visible={!!selectedPlace} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPlace && <PlaceReview place={selectedPlace} />}
            <TouchableOpacity onPress={() => setSelectedPlace(null)} style={styles.closeBtn}>
              <Text style={{ color: '#fff' }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold' },
  headerButtons: { flexDirection: 'row' },
  redBtn: { width: 20, height: 20, backgroundColor: 'red', marginLeft: 8 },
  orangeBtn: { width: 20, height: 20, backgroundColor: 'orange', marginLeft: 8 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  imageBox: { marginRight: 12, alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 8 },
  placeName: { fontSize: 12, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(223, 182, 94, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  closeBtn: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default RecommendPage;
