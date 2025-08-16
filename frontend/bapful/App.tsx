import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Home from './Home';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import RecommendPage from './RecommendPage';
import { TOKEN_STORAGE_KEY } from './api';

const App = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) setLoggedIn(true);
      } finally {
        setInitLoading(false);
      }
    })();
  }, []);

  if (initLoading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!loggedIn) {
    if (showRegister) {
      return <RegisterPage onSuccess={() => setLoggedIn(true)} goToLogin={() => setShowRegister(false)} />;
    }
    return <LoginPage onSuccess={() => setLoggedIn(true)} goToRegister={() => setShowRegister(true)} />;
  }

  if (showRecommendations) {
    return <RecommendPage onBack={() => setShowRecommendations(false)} />;
  }

  return <Home onShowRecommendations={() => setShowRecommendations(true)} />;
};

export default App;
