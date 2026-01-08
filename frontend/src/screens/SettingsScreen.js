// ==================== SettingsScreen.js ====================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useUser } from '../utils/UserContext';

const SettingsScreen = () => {
  const { user, logout } = useUser();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Email</Text>
          <Text style={styles.itemValue}>{user.email}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Account Type</Text>
          <Text style={styles.itemValue}>{user.role === 'student' ? 'Student' : 'Company'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>App Version</Text>
          <Text style={styles.itemValue}>1.0.0</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Developer</Text>
          <Text style={styles.itemValue}>ForsaLink Team</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  section: { backgroundColor: '#fff', marginTop: 15, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemLabel: { fontSize: 15, color: '#6b7280' },
  itemValue: { fontSize: 15, color: '#1f2937', fontWeight: '600' },
  logoutButton: { backgroundColor: '#ef4444', margin: 20, padding: 15, borderRadius: 10, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default SettingsScreen;
