import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert
} from 'react-native';
import { login } from './api';
import { AxiosError } from 'axios';

interface LoginPageProps {
  navigation?: any;
  onSuccess?: () => void;
  goToRegister?: () => void;
}

const LoginPage = ({ navigation, onSuccess, goToRegister }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !pw) {
      Alert.alert('알림', 'Username / Password 를 입력하세요.');
      return;
    }
    // Check if email format is in form 'xxx@xxx.xxx'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('이메일 오류', '올바른 이메일 형식을 입력해주세요\n(예: user@example.com)');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), pw);
      if (onSuccess) onSuccess();
      else if (navigation) navigation.replace('Home');
    } catch (e: any) {
      const error = e as AxiosError;
      // console.error('Login error:', e);
      console.log(error);
      Alert.alert('Incorrect credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Image
            source={require('./assets/bapful_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcome}>Welcome,</Text>
          <Text style={styles.tagline}>find your soul food !</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <Image source={require('./assets/user.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#C9B298"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          <View style={styles.separator} />

          <View style={styles.inputRow}>
            <Image source={require('./assets/user.png')} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#C9B298"
              value={pw}
              onChangeText={setPw}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>
          <View style={styles.separator} />

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.loginText}>Login</Text>}
          </TouchableOpacity>

          {goToRegister && (
            <TouchableOpacity style={styles.registerLink} onPress={goToRegister}>
              <Text style={styles.registerText}>Create an account</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const BG = '#FAF1DC';
const ACCENT = '#8B5E2B';
const TITLE = '#5A260F';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center'
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 56
  },
  logo: {
    width: 200,
    height: 120,
    marginBottom: 10
  },
  welcome: {
    fontSize: 30,
    fontWeight: '700',
    color: TITLE,
    letterSpacing: 0.5
  },
  tagline: {
    fontSize: 15,
    color: ACCENT,
    marginTop: 6
  },
  form: {},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  icon: {
    width: 26,
    height: 26,
    marginRight: 12,
    tintColor: ACCENT,
    opacity: 0.9
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#3E2812',
    paddingVertical: 0
  },
  separator: {
    height: 1,
    backgroundColor: '#E3CCAF'
  },
  loginBtn: {
    marginTop: 40,
    backgroundColor: ACCENT,
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  registerLink: {
    marginTop: 22,
    alignItems: 'center'
  },
  registerText: {
    color: ACCENT,
    fontSize: 13,
    textDecorationLine: 'underline'
  }
});

export default LoginPage;