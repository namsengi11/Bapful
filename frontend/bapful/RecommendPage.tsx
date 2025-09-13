// RecommendPage.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { getRecommendations, RecommendationSection, API_BASE_URL, healthCheck } from './api';
import PlaceReview from './PlaceReview';
import { Place } from './Place';

interface RecommendPageProps { onBack?: () => void }

const RecommendPage = ({ onBack }: RecommendPageProps) => {
  const [data, setData] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{lat:number; lng:number} | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { t } = useTranslation();

  const requestLocation = useCallback(async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCoords(null); // 위치 없이 추천
      } else {
        const pos = await Location.getCurrentPositionAsync({});
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }
    } catch {
      setCoords(null);
    } finally {
      setLocLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sections: RecommendationSection[] = await getRecommendations({ lat: coords?.lat, lng: coords?.lng });
      const formattedData = sections.map(section => {
        return Place.fromAPIResponse(section);
      });
      console.log(formattedData);
      setData(formattedData);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'API fetch error');
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    // 위치 요청이 끝난 뒤 추천 로드
    if (!locLoading) {
      loadData();
    }
  }, [locLoading, loadData]);

  const retry = () => {
    requestLocation();
  };

  const content = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#8B5E2B" />
          <Text style={styles.hint}>추천 불러오는 중...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={retry}>
            <Text style={styles.retryTxt}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!data.length) {
      return (
        <View style={styles.center}>
          <Text style={styles.hint}>추천 데이터가 없습니다.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={retry}>
            <Text style={styles.retryTxt}>새로고침</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.scroll}>
        {data.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{t(section.category)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {section.items.map((place) => (
                <TouchableOpacity
                  key={`${place.latitude}-${place.longitude}`}
                  style={styles.imageBox}
                  onPress={() => setSelectedPlace(place)}
                >
                  {/* Placeholder image handling; adjust field names based on backend response */}
                  {/* <Image source={{ uri: place.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.image} /> */}
                  <Text style={styles.placeName}>{place.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('user_profile_title')} (매운맛 중독자)</Text>
        <View style={styles.headerButtons}>
          {onBack && (
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Text style={{color:'#fff'}}>뒤로</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {locLoading && (
        <View style={styles.locBanner}>
          <Text style={styles.locText}>위치 확인 중...</Text>
        </View>
      )}
      {content()}

      {/* 모달 상세 보기 */}
      <Modal visible={!!selectedPlace} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPlace && <PlaceReview place={selectedPlace} />}
            <TouchableOpacity onPress={() => setSelectedPlace(null)} style={styles.closeBtn}>
              <Text style={{ color: '#fff' }}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

function labelForCategory(key: string) {
  switch (key) {
    case 'popular': return '인기';
    case 'top_rated': return '높은 평점';
    case 'nearby': return '주변';
    case 'new': return 'NEW';
    default: return key;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#E8D1A0'
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backTxt: { fontSize: 16, color: '#5A3A10' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#5A3A10' },
  locBanner: { backgroundColor: '#F5EAD3', padding: 8, alignItems: 'center' },
  locText: { fontSize: 12, color: '#6A4B20' },
  scroll: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8, color: '#4A3212' },
  empty: { fontSize: 13, color: '#888' },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  itemName: { fontSize: 15, fontWeight: '600', color: '#3A2810' },
  meta: { marginTop: 4, fontSize: 12, color: '#6B6055' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  hint: { marginTop: 12, fontSize: 14, color: '#555' },
  error: { marginBottom: 16, fontSize: 14, color: '#B00020', textAlign: 'center' },
  retryBtn: { backgroundColor: '#8B5E2B', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24 },
  retryTxt: { color: '#FFF', fontWeight: '600' },
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
  imageBox: { marginRight: 12, alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 8 },
  placeName: { fontSize: 12, marginTop: 4 },
});

export default RecommendPage;
