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
import { useTranslation } from 'react-i18next';
import axios from 'axios';

type Place = {
  id: number;
  name: string;
  address: string;
  image: string;
  description: string;
};

type CategoryData = {
  category: string;
  items: Place[];
};

const RecommendPage = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('https://your-api.com/recommendations');
        setData(res.data); 
      } catch (e) {
        console.error('API fetch error:', e);
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
        <Text style={styles.title}>{t('user_profile_title')} (ex. 매운맛 중독자)</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.redBtn} onPress={() => {/* navigation.navigate('UserProfile') */}} />
          <TouchableOpacity style={styles.orangeBtn} disabled />
        </View>
      </View>

      {/* 성향별 추천 리스트 */}
      <ScrollView>
        {data.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{t(section.category)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {section.items.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.imageBox}
                  onPress={() => setSelectedPlace(place)}
                >
                  <Image source={{ uri: place.image }} style={styles.image} />
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
            <Text style={styles.modalTitle}>{selectedPlace?.name}</Text>
            <Text>{selectedPlace?.address}</Text>
            <Text>{selectedPlace?.description}</Text>
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
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  imageBox: { marginRight: 12, alignItems: 'center' },
  image: { width: 100, height: 100, borderRadius: 8 },
  placeName: { fontSize: 12, marginTop: 4 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  closeBtn: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
});
