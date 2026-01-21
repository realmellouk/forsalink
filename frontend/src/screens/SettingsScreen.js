import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '../utils/UserContext';
import { api } from '../config/api';

const SettingsScreen = () => {
  const { user, logout } = useUser();

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Are you sure you want to logout?')) {
        logout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await api.changePassword(user.id, oldPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordFields(false); // Close fields after success
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Email</Text>
          <Text style={styles.itemValue}>{user?.email}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Role</Text>
          <Text style={styles.itemValue}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Version</Text>
          <Text style={styles.itemValue}>1.0.0</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Developer</Text>
          <Text style={styles.itemValue}>Forsalink</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        {/* Toggle Button */}
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowPasswordFields(!showPasswordFields)}
        >
          <Text style={styles.toggleButtonText}>
            {showPasswordFields ? '✕ Cancel Password Change' : '🔒 Change Password'}
          </Text>
        </TouchableOpacity>

        {/* Password Fields - Only show when showPasswordFields is true */}
        {showPasswordFields && (
          <View style={styles.passwordFieldsContainer}>
            <View style={styles.field}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  placeholder="Enter current password"
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Text style={styles.eyeIcon}>{showOldPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholder="Enter new password (min 6 chars)"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handlePasswordChange}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.changePasswordButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  section: { backgroundColor: '#fff', marginTop: 15, padding: 20, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: '#e5e7eb', borderBottomColor: '#e5e7eb' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemLabel: { fontSize: 15, color: '#6b7280' },
  itemValue: { fontSize: 15, color: '#1f2937', fontWeight: '600' },

  toggleButton: { 
    backgroundColor: '#2563eb', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center',
    marginBottom: 10
  },
  toggleButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  passwordFieldsContainer: {
    marginTop: 10,
  },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  passwordTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 15 },
  passwordInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8 },
  passwordInput: { flex: 1, padding: 12, fontSize: 16 },
  eyeIcon: { fontSize: 20, paddingHorizontal: 12 },
  changePasswordButton: { backgroundColor: '#16a34a', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 10 },
  changePasswordButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  logoutButton: { backgroundColor: '#ef4444', margin: 20, padding: 15, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SettingsScreen;