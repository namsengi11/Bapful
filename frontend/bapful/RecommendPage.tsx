// RecommendPage.tsx

import { useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Place } from './Place';
import { getRecommendations, RecommendationSection, API_BASE_URL, healthCheck } from './api';
import * as Location from 'expo-location';
import PlaceReview from './PlaceReview';

type CategoryData = {
  category: string;
  items: Place[];
};

interface RecommendPageProps { onBack?: () => void }

const RecommendPage = ({ onBack }: RecommendPageProps) => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{lat:number; lng:number} | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[Recommend] Using API base:', API_BASE_URL);
        // Quick health check (will throw if network unreachable)
        try {
          const hc = await healthCheck();
          console.log('[Recommend] Health OK:', hc);
        } catch (err) {
          console.log('[Recommend] Health check failed', err);
        }
        // Try to get location (optional)
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              const loc = await Location.getCurrentPositionAsync({});
              setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            }
        } catch {
          // ignore location errors
        }
        const sections: RecommendationSection[] = await getRecommendations({ lat: coords?.lat, lng: coords?.lng });
        const formattedData = sections.map(section => ({
          category: section.category,
          items: section.items.map(item => Place.fromRecommendationItem(item)),
        }));
        setData(formattedData);
      } catch (e: any) {
        console.error('API fetch error:', e);
        if (e?.message === 'Network Error') {
          console.log('[Recommend] Possible causes: wrong base URL, server down, http->https blocked, emulator offline');
        }
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error) return <View style={styles.center}><Text>{error}</Text></View>;
  if (!data.length) return <View style={styles.center}><Text>추천 데이터가 없습니다.</Text></View>;

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

      {/* 유저 성향별 추천 리스트 */}
      <ScrollView>
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
                  <Image source={{ uri: place.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.image} />
                  <Text style={styles.placeName}>{place.name}</Text>
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
              <Text style={{ color: '#fff' }}>{t('close')}</Text>
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
  backBtn: { paddingHorizontal:12, paddingVertical:6, backgroundColor:'#8a5a00', borderRadius:8, marginLeft:8 },
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
  center: { flex:1, justifyContent:'center', alignItems:'center' }
});

export default RecommendPage;
