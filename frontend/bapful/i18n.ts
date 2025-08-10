import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      user_profile_title: "User Profile",
      close: "Close",
      spicy_food: "Spicy Food",
      korean_food: "Korean Food"
    }
  },
  ko: {
    translation: {
      user_profile_title: "사용자 프로필", 
      close: "닫기",
      spicy_food: "매운 음식",
      korean_food: "한국 음식"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;