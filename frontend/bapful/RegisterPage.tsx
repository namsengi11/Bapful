import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { register } from './api';

interface RegisterPageProps {
  onSuccess?: () => void;
  goToLogin?: () => void;
}

const BG = '#FAF1DC';
const ACCENT = '#8B5E2B';
const TITLE = '#5A260F';

const RegisterPage = ({ onSuccess, goToLogin }: RegisterPageProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const disabled = !name || !email || !pw || pw !== confirm;

  async function handleRegister() {
    if (disabled) {
      Alert.alert('알림', '모든 항목을 채우고 비밀번호를 확인하세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await register(name.trim(), email.trim(), pw);
      Alert.alert('환영합니다', `${data.user.name} 님 가입 완료`);
      onSuccess && onSuccess();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || '회원가입 실패';
      Alert.alert('실패', msg);
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
          <Text style={styles.welcome}>Create Account</Text>
          <Text style={styles.tagline}>find your soul food !</Text>
        </View>

        <View style={styles.form}>
          <Field
            icon={require('./assets/user.png')}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <Separator />
          <Field
            icon={require('./assets/user.png')}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Separator />
          <Field
            icon={require('./assets/user.png')}
            placeholder="Password"
            value={pw}
            onChangeText={setPw}
            secureTextEntry
          />
          <Separator />
            <Field
              icon={require('./assets/user.png')}
              placeholder="Confirm Password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
            />
          <Separator />

          {pw && confirm && pw !== confirm && (
            <Text style={styles.warn}>비밀번호가 일치하지 않습니다.</Text>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, (disabled || loading) && { opacity: 0.55 }]}
            disabled={disabled || loading}
            onPress={handleRegister}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.submitText}>Sign Up</Text>}
          </TouchableOpacity>

          {goToLogin && (
            <TouchableOpacity style={styles.linkBtn} onPress={goToLogin}>
              <Text style={styles.linkText}>이미 계정이 있나요? Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const Field = (props: any) => (
  <View style={styles.inputRow}>
    <Image source={props.icon} style={styles.icon} />
    <TextInput
      style={styles.input}
      placeholderTextColor="#C9B298"
      {...props}
    />
  </View>
);

const Separator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  container: { flex: 1, paddingHorizontal: 40, justifyContent: 'center' },
  logoBox: { alignItems: 'center', marginBottom: 50 },
  logo: { width: 180, height: 110, marginBottom: 10 },
  welcome: { fontSize: 28, fontWeight: '700', color: TITLE, letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: ACCENT, marginTop: 4 },
  form: {},
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  icon: { width: 24, height: 24, marginRight: 12, tintColor: ACCENT, opacity: 0.9 },
  input: { flex: 1, fontSize: 15, color: '#3E2812', paddingVertical: 0 },
  separator: { height: 1, backgroundColor: '#E3CCAF' },
  warn: { marginTop: 12, color: '#B00020', fontSize: 12 },
  submitBtn: {
    marginTop: 36,
    backgroundColor: ACCENT,
    paddingVertical: 15,
    borderRadius: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  linkBtn: { marginTop: 24, alignItems: 'center' },
  linkText: { color: ACCENT, fontSize: 13, textDecorationLine: 'underline' }
});

export default RegisterPage;
