import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';
import ErrorMessage from '../../components/ErrorMessage';

const CompanyProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [companyDescription, setCompanyDescription] = useState(user?.company_description || '');
  const [error, setError] = useState(null);
  const [companyLogo, setCompanyLogo] = useState(user?.company_logo || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplicants: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  // Reload stats when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });
    return unsubscribe;
  }, [navigation]);

 const loadStats = async () => {
  try {
    const jobs = await api.getCompanyJobs(user.id);
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    
    // Get total applicants across all jobs
    let totalApplicants = 0;
    for (const job of jobs) {
      const applications = await api.getJobApplicationsScreen(job.id);
      totalApplicants += applications.length;
    }

    setStats({
      totalJobs: jobs.length,
      activeJobs: activeJobs,
      totalApplicants: totalApplicants
    });
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
};

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setProfilePicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error(error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera permissions to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setProfilePicture(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      console.error(error);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Company name is required');
      return;
    }

    setSaving(true);
    try {
      await api.updateUser(user.id, {
        full_name: fullName,
        company_description: companyDescription,
        company_logo: companyLogo,
        profile_picture: profilePicture
      });
      await updateUser({
        full_name: fullName,
        company_description: companyDescription,
        company_logo: companyLogo,
        profile_picture: profilePicture
      });
      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      setError('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.full_name || '');
    setCompanyDescription(user?.company_description || '');
    setProfilePicture(user?.profile_picture || '');
    setEditing(false);
  };

  const handlerRetry = () => {
    setError(null);
    handleSave();
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={handlerRetry} />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={editing ? pickImage : null}
          disabled={!editing}
        >
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0) || 'C'}</Text>
          )}
          {editing && (
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{user?.full_name || 'Guest'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🏢 Company</Text>
        </View>
      </View>

      {/* Stats Section */}
      {!editing && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalJobs}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalApplicants}</Text>
            <Text style={styles.statLabel}>Applicants</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!editing ? (
          <>
            <TouchableOpacity style={styles.editButton} onPress={() => setEditing(true)}>
              <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
            </TouchableOpacity>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('CompanyDashboardScreen')}
              >
                <Text style={styles.quickActionIcon}>📋</Text>
                <Text style={styles.quickActionText}>My Jobs</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('AddJobScreen')}
              >
                <Text style={styles.quickActionIcon}>➕</Text>
                <Text style={styles.quickActionText}>Post Job</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
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
          <Text style={styles.sectionTitle}>Company Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Company Name *</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter company name"
              />
            ) : (
              <Text style={styles.value}>{fullName || 'Not set'}</Text>
            )}
          </View>

          {editing && (
            <View style={styles.field}>
              <Text style={styles.label}>Company Logo</Text>
              <View style={styles.imagePickerButtons}>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  <Text style={styles.imagePickerButtonText}>📁 Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imagePickerButton} onPress={takePhoto}>
                  <Text style={styles.imagePickerButtonText}>📷 Camera</Text>
                </TouchableOpacity>
              </View>
              {profilePicture && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setProfilePicture('')}
                >
                  <Text style={styles.removeImageButtonText}>✕ Remove Picture</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Company Description</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={companyDescription}
                onChangeText={setCompanyDescription}
                placeholder="Tell students about your company..."
                multiline
                numberOfLines={5}
              />
            ) : (
              <Text style={styles.value}>{companyDescription || 'No description'}</Text>
            )}
          </View>
        </View>

        {/* Tips Section */}
        {!editing && (
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Tips for Success</Text>
            <Text style={styles.tipItem}>• Keep your company description updated</Text>
            <Text style={styles.tipItem}>• Upload a professional company logo</Text>
            <Text style={styles.tipItem}>• Respond to applicants promptly</Text>
            <Text style={styles.tipItem}>• Post clear and detailed job descriptions</Text>
          </View>
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 30, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
      }
    })
  },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    alignItems: 'center',
  },
  cameraIcon: { fontSize: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
  email: { fontSize: 14, color: '#6b7280', marginBottom: 15 },
  badge: { backgroundColor: '#dbeafe', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#1e40af' },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb'
  },
  statCard: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 5
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 10
  },

  buttonContainer: { padding: 20 },
  editButton: { backgroundColor: '#2563eb', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15 },
  editButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  quickActions: {
    flexDirection: 'row',
    gap: 10
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937'
  },

  editActions: { flexDirection: 'row' },
  cancelButton: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 10, padding: 15, alignItems: 'center', marginRight: 10 },
  cancelButtonText: { color: '#6b7280', fontSize: 16, fontWeight: 'bold' },
  saveButton: { flex: 1, backgroundColor: '#10b981', borderRadius: 10, padding: 15, alignItems: 'center', marginLeft: 10 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  form: { padding: 20, paddingTop: 0 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10
  },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  value: { fontSize: 16, color: '#1f2937' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  imagePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  imagePickerButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 5
  },
  imagePickerButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  removeImageButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 5
  },
  removeImageButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  tipsSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12
  },
  tipItem: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 22,
    marginBottom: 5
  }
});

export default CompanyProfileScreen;