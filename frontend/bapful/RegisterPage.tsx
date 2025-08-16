import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { register } from './api';

interface RegisterPageProps { onSuccess?: () => void; goToLogin?: () => void; }

const RegisterPage = ({ onSuccess, goToLogin }: RegisterPageProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const disabled = !name || !email || !password || password !== confirm;

  const handleRegister = async () => {
    if (disabled) {
      Alert.alert('Error', 'Fill all fields and ensure passwords match.');
      return;
    }
    setLoading(true);
    try {
      const data = await register(name, email, password);
      Alert.alert('Success', `Welcome ${data.user.name}!`);
      onSuccess && onSuccess();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || 'Failed to register';
      Alert.alert('Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' keyboardType='email-address' />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput style={styles.input} placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <TouchableOpacity style={[styles.button, disabled && styles.buttonDisabled]} disabled={disabled || loading} onPress={handleRegister}>
        {loading ? <ActivityIndicator color='#fff' /> : <Text style={styles.buttonText}>Create Account</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={goToLogin} style={styles.linkArea}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:24, backgroundColor:'#fff' },
  title: { fontSize:24, fontWeight:'bold', textAlign:'center', marginBottom:32 },
  input: { borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:12, marginBottom:12 },
  button: { backgroundColor:'#dfb65e', padding:16, borderRadius:8, alignItems:'center', marginTop:8 },
  buttonDisabled: { opacity:0.5 },
  buttonText: { color:'#fff', fontWeight:'bold', fontSize:16 },
  linkArea: { marginTop:20, alignItems:'center' },
  linkText: { color:'#555' }
});

export default RegisterPage;
