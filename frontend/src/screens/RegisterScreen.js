// Register Screen
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { api } from '../config/api';

const RegisterScreen = ({ navigation }) => {
  const [role, setRole] = useState(null); // 'student' or 'company'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setRole(null);
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setBio('');
  };

  const handleNavigateToLogin = () => {
    resetForm();
    navigation.navigate('Login');
  };

  const handleRegister = async () => {
    // Validation
    if (!role) {
      Alert.alert('Error', 'Please select account type');
      return;
    }
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        full_name: fullName,
        email,
        password,
        role,
        bio: role === 'student' ? bio : null,
        company_description: role === 'company' ? bio : null
      };

      const response = await api.register(userData);
      
      if (response.error) {
        Alert.alert('Registration Failed', response.error);
      } else {
        Alert.alert(
          'Success!', 
          'Account created successfully. Please login.',
          [{ 
            text: 'OK', 
            onPress: () => navigation.navigate('Login', { 
              email: email, 
              password: password 
            }) 
          }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ForsaLink today</Text>
        </View>

        {/* Role Selection */}
        {!role ? (
          <View style={styles.roleSelection}>
            <Text style={styles.sectionTitle}>I am a...</Text>
            
            <TouchableOpacity 
              style={styles.roleCard}
              onPress={() => setRole('student')}
            >
              <Text style={styles.roleIcon}>🎓</Text>
              <Text style={styles.roleTitle}>Student</Text>
              <Text style={styles.roleDescription}>
                Looking for internships and part-time jobs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.roleCard}
              onPress={() => setRole('company')}
            >
              <Text style={styles.roleIcon}>🏢</Text>
              <Text style={styles.roleTitle}>Company</Text>
              <Text style={styles.roleDescription}>
                Posting jobs and hiring students
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Registration Form
          <View style={styles.form}>
            <View style={styles.selectedRole}>
              <Text style={styles.selectedRoleText}>
                {role === 'student' ? '🎓 Student Account' : '🏢 Company Account'}
              </Text>
              <TouchableOpacity onPress={() => setRole(null)}>
                <Text style={styles.changeRole}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {role === 'student' ? 'Full Name' : 'Company Name'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={role === 'student' ? 'e.g. Ahmed El Amrani' : 'e.g. TechCorp Morocco'}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                {role === 'student' ? 'Bio (Optional)' : 'Company Description (Optional)'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={role === 'student' 
                  ? 'Tell us about yourself...' 
                  : 'Describe your company...'}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleNavigateToLogin}
            >
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={handleNavigateToLogin}
            >
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280'
  },
  roleSelection: {
    width: '100%'
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 20
  },
  roleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  roleIcon: {
    fontSize: 50,
    marginBottom: 15
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  roleDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center'
  },
  backButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600'
  },
  form: {
    width: '100%'
  },
  selectedRole: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  selectedRoleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af'
  },
  changeRole: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600'
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
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  registerButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 15
  },
  loginButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center'
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6b7280'
  },
  loginLinkBold: {
    color: '#2563eb',
    fontWeight: 'bold'
  }
});

export default RegisterScreen;