import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator ,Image} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';
import ErrorMessage from '../../components/ErrorMessage'; 

const CompanyProfileScreen = () => {
  const { user, updateUser, logout } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(user.full_name);
  const [companyDescription, setCompanyDescription] = useState(user.company_description || '');
  const [error, setError] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(user.company_logo || '');
  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateUser(user.id, { full_name: fullName, company_description: companyDescription, company_logo: companyLogo });
      await updateUser({ full_name: fullName, company_description: companyDescription, company_logo: companyLogo });
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
        setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    // For web, use window.confirm
    if (typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Are you sure you want to logout?')) {
        console.log('Logout confirmed');
        logout();
      }
    } else {
      // For mobile
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => logout()
        }
      ]);
    }
  };
  const loadJobs = async () => {
    try {
      setError(null);
      const data = await api.getCompanyJobs(user.id);
      setJobs(data);
    } catch (error) {
    console.error('Load jobs error:', error);
    setError('Unable to load your jobs. Please check your connection.');
  } finally {
    setLoading(false);
    setRefreshing(false);
    }
  };

  //retry handler
  const handlerRetry = () => {
    setLoading(true);
    loadJobs();
  };  

  //befor return statement
  if (error){
    return <ErrorMessage message={error} onRetry={handlerRetry} />;
  }


  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.full_name.charAt(0)}</Text>
        </View>
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🏢 Company</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        {!editing ? (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.section}>
          <View style={styles.field}>
            <Text style={styles.label}>Company Name</Text>
            {editing ? (
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
            ) : (
              <Text style={styles.value}>{fullName}</Text>
            )}
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            {editing ? (
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={companyDescription} 
                onChangeText={setCompanyDescription} 
                multiline 
                numberOfLines={5} 
              />
            ) : (
              <Text style={styles.value}>{companyDescription || 'No description'}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 15 },
  badge: { backgroundColor: '#dbeafe', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#1e40af' },
  buttonContainer: { padding: 20 },
  editButton: { backgroundColor: '#2563eb', borderRadius: 10, padding: 15, alignItems: 'center' },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  editActions: { flexDirection: 'row' },
  cancelButton: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 10, padding: 15, alignItems: 'center', marginRight: 10 },
  cancelButtonText: { color: '#6b7280', fontSize: 16, fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#10b981', borderRadius: 10, padding: 15, alignItems: 'center', marginLeft: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  form: { padding: 20 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  value: { fontSize: 16, color: '#1f2937' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  logoutButton: { 
    backgroundColor: '#ef4444', 
    margin: 20, 
    marginTop: 10,
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default CompanyProfileScreen;