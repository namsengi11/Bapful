import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Place } from './Place';

/* ---------------- Base URL Resolver ---------------- */
function resolveApiBase(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');
  // 배포 기본값
  const prod = 'http://bapful.sjnam.site/api';
  // 개발 모드 로컬 fallback
  // if (__DEV__) {
  //   if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  //   return 'http://127.0.0.1:8000';
  // }
  console.log('prod', prod);
  return prod;
}

export const API_BASE_URL: string = resolveApiBase();

/* ---------------- Types ---------------- */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface RecommendationItem {
  location_id: string;
  name: string;
  location_type?: string | null;
  coordinates?: { lat: number; lng: number };
  avg_rating?: number | null;
  review_count?: number;
  distance?: number;
}

export interface RecommendationSection {
  category: string;
  items: RecommendationItem[];
}

/* ---------------- Storage Keys ---------------- */
export const TOKEN_STORAGE_KEY = 'auth_token';
export const USER_STORAGE_KEY = 'auth_user';

/* ---------------- Axios Instance ---------------- */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, function(error: AxiosError) {
  return Promise.reject(error);
});

api.interceptors.response.use(async (response) => {
  return response;
}, function(error: AxiosError) {
    console.log('error', error);
    return Promise.reject(error);
});

/* ---------------- Auth ---------------- */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  console.log('data', data);
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  return data;
}

export async function logout() {
  await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
}

/* ---------------- Health ---------------- */
export async function healthCheck(): Promise<any> {
  const { data } = await api.get('/health');
  return data;
}

/* ---------------- Recommendations ---------------- */
export async function getRecommendations(opts?: {
  lat?: number;
  lng?: number;
  perCategory?: number;
}): Promise<RecommendationSection[]> {
  const params: Record<string, any> = {};
  if (opts?.lat != null && opts?.lng != null) {
    params.lat = opts.lat;
    params.lng = opts.lng;
  }
  if (opts?.perCategory) params.per_category = opts.perCategory;
  const { data } = await api.get<RecommendationSection[]>('/locations', { params });
  return data;
}

export async function searchLocations(keyword: string, lat: number, lng: number): Promise<Place[]> {
  console.log('query', keyword);
  console.log('lat', lat);
  console.log('lng', lng);
  const { data } = await api.get<Place[]>('/locations/search', { params: { query: keyword, lat, lng } });
  return data;
}

/* ---------------- Debug Log (last) ---------------- */
console.log('[API] Base URL:', API_BASE_URL);

export default api;
