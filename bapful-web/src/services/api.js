/* ---------------- Base URL Resolver ---------------- */
function resolveApiBase() {
  const envUrl = process.env.REACT_APP_API_BASE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, '');

  // 배포 환경 기본값
  const prod = 'http://bapful.sjnam.site/api';

  return prod;
}

export const API_BASE_URL = resolveApiBase();

/* ---------------- Storage Keys ---------------- */
export const TOKEN_STORAGE_KEY = 'bapful_auth_token';
export const USER_STORAGE_KEY = 'bapful_auth_user';

/* ---------------- Storage Helper Functions ---------------- */
export const storage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
};

/* ---------------- HTTP Helper Functions ---------------- */
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = storage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.response = { status: response.status, data: errorData };
    throw error;
  }

  return response.json();
};

const apiRequest = async (url, options = {}) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  const config = {
    timeout: 15000,
    headers: createHeaders(options.includeAuth !== false),
    ...options,
  };

  try {
    const response = await fetch(fullUrl, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Error:', error);

    // 401 Unauthorized - 토큰 만료 또는 잘못된 토큰
    if (error.status === 401) {
      storage.removeItem(TOKEN_STORAGE_KEY);
      storage.removeItem(USER_STORAGE_KEY);
    }

    throw error;
  }
};

/* ---------------- Auth Functions ---------------- */
export async function login(credentials) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    includeAuth: false,
  });

  console.log('Login successful:', data);

  // 토큰과 사용자 정보 저장
  storage.setItem(TOKEN_STORAGE_KEY, data.access_token);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

  return data;
}

export async function register(userData) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
    includeAuth: false,
  });

  console.log('Registration successful:', data);

  // 토큰과 사용자 정보 저장
  storage.setItem(TOKEN_STORAGE_KEY, data.access_token);
  storage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));

  return data;
}

export async function logout() {
  try {
    // 서버에서 로그아웃 처리가 필요한 경우
    // await apiRequest('/auth/logout', { method: 'POST' });

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

export function getCurrentUser() {
  try {
    const userStr = storage.getItem(USER_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

export function isAuthenticated() {
  return !!storage.getItem(TOKEN_STORAGE_KEY);
}

/* ---------------- Health Check ---------------- */
export async function healthCheck() {
  return await apiRequest('/health', { includeAuth: false });
}

/* ---------------- Locations ---------------- */
export async function getRecommendations(opts = {}) {
  const params = new URLSearchParams();
  if (opts.lat != null && opts.lng != null) {
    params.append('lat', opts.lat);
    params.append('lng', opts.lng);
  }
  if (opts.perCategory) params.append('per_category', opts.perCategory);

  const queryString = params.toString();
  const url = `/locations${queryString ? `?${queryString}` : ''}`;

  return await apiRequest(url);
}

export async function searchLocations(keyword, lat, lng) {
  const params = new URLSearchParams({
    query: keyword,
    lat: lat.toString(),
    lng: lng.toString()
  });

  const data = await apiRequest(`/locations/search?${params.toString()}`);
  return data;
}

/* ---------------- Debug Log ---------------- */
console.log('[API] Base URL:', API_BASE_URL);
