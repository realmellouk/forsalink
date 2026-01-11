// Login Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useUser } from '../utils/UserContext';
import { api } from '../config/api';
import Button from '../components/Button';

const LoginScreen = ({ navigation, route }) => {
  // Pre-fill email and password if coming from registration
  const [email, setEmail] = useState(route?.params?.email || '');
  const [password, setPassword] = useState(route?.params?.password || '');
  const [loading, setLoading] = useState(false);
  const { login, user } = useUser();

  // Update email and password when route params change
  useEffect(() => {
    if (route?.params?.email) {
      setEmail(route.params.email);
    }
    if (route?.params?.password) {
      setPassword(route.params.password);
    }
  }, [route?.params]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigation.replace('StudentMain');
      } else {
        navigation.replace('CompanyMain');
      }
    }
  }, [user, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      const response = await api.login(trimmedEmail, trimmedPassword);

      if (response.error) {
        Alert.alert('Login Failed', response.error);
      } else {
        await login(response.user);
        // Navigation happens automatically via UserContext
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Connection failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>💼</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              textContentType="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="off"
              textContentType="none"
            />
          </View>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 10 }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Create New Account"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
          />
        </View>

      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    fontSize: 60,
    marginBottom: 10
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280'
  },
  form: {
    width: '100%'
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#1f2937'
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb'
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#9ca3af',
    fontSize: 14
  },
  registerButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center'
  },
  registerButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: 'bold'
  },
  testAccounts: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcd34d'
  },
  testTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8
  },

});

export default LoginScreen;