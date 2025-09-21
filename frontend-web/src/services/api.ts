import axios, { AxiosError } from 'axios';
import { LoginRequest, RegisterRequest, LoginResponse, User } from '../types';

/* ---------------- Base URL Resolver ---------------- */
function resolveApiBase(): string {
  const envUrl = process.env.REACT_APP_API_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');
  
  // 배포 환경 기본값
  const prod = 'http://bapful.sjnam.site/api';
  
  // 개발 모드 로컬 fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000';
  }
  
  console.log('Using production API:', prod);
  return prod;
}

export const API_BASE_URL: string = resolveApiBase();

/* ---------------- Types ---------------- */
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

export interface Place {
  id: string;
  name: string;
  location_type: string;
  coordinates: { lat: number; lng: number };
  avg_rating?: number;
  review_count?: number;
  distance?: number;
}

/* ---------------- Storage Keys ---------------- */
export const TOKEN_STORAGE_KEY = 'bapful_auth_token';
export const USER_STORAGE_KEY = 'bapful_auth_user';

/* ---------------- Storage Helper Functions ---------------- */
export const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
    }
  },
  
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

/* ---------------- Axios Instance ---------------- */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = storage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - 에러 처리
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error);
    
    // 401 Unauthorized - 토큰 만료 또는 잘못된 토큰
    if (error.response?.status === 401) {
      storage.removeItem(TOKEN_STORAGE_KEY);
      storage.removeItem(USER_STORAGE_KEY);
      // 리다이렉트 처리는 컴포넌트 레벨에서 처리
    }
    
    return Promise.reject(error);
  }
);

/* ---------------- Auth Functions ---------------- */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', credentials);
  console.log('Login successful:', data);
  
  // 토큰과 사용자 정보 저장
  storage.setItem(TOKEN_STORAGE_KEY, data.access_token);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  
  return data;
}

export async function register(userData: RegisterRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/register', userData);
  console.log('Registration successful:', data);
  
  // 토큰과 사용자 정보 저장
  storage.setItem(TOKEN_STORAGE_KEY, data.access_token);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  
  return data;
}

export async function logout(): Promise<void> {
  try {
    // 서버에서 로그아웃 처리가 필요한 경우
    // await api.post('/auth/logout');
    
    // 로컬 저장소에서 인증 정보 제거
    storage.removeItem(TOKEN_STORAGE_KEY);
    storage.removeItem(USER_STORAGE_KEY);
    
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    // 에러가 발생해도 로컬 저장소는 정리
    storage.removeItem(TOKEN_STORAGE_KEY);
    storage.removeItem(USER_STORAGE_KEY);
  }
}

export function getCurrentUser(): User | null {
  try {
    const userStr = storage.getItem(USER_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!storage.getItem(TOKEN_STORAGE_KEY);
}

/* ---------------- Health Check ---------------- */
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
  console.log('Searching locations:', { keyword, lat, lng });
  const { data } = await api.get<Place[]>('/locations/search', { 
    params: { query: keyword, lat, lng } 
  });
  return data;
}

/* ---------------- Debug Log ---------------- */
console.log('[API] Base URL:', API_BASE_URL);

export default api;