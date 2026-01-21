// Student Profile Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

const StudentProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [levelOfStudy, setLevelOfStudy] = useState(user?.level_of_study || '');
  const [cvLink, setCvLink] = useState(user?.cv_link || '');
  const [interests, setInterests] = useState(user?.interests || '');
  const [profilePicture, setProfilePicture] = useState(user?.profile_picture || '');

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload a profile picture.');
        return;
      }

      // Launch image picker
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
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera permissions to take a photo.');
        return;
      }

      // Launch camera
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
    setSaving(true);
    try {
      const userData = {
        full_name: fullName,
        bio,
        level_of_study: levelOfStudy,
        cv_link: cvLink,
        interests,
        profile_picture: profilePicture
      };

      const response = await api.updateUser(user.id, userData);

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        await updateUser(userData);
        setEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFullName(user?.full_name || '');
    setBio(user?.bio || '');
    setLevelOfStudy(user?.level_of_study || '');
    setCvLink(user?.cv_link || '');
    setInterests(user?.interests || '');
    setProfilePicture(user?.profile_picture || '');
    setEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.avatar}
          onPress={editing ? pickImage : null}
          disabled={!editing}
        >
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
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
          <Text style={styles.badgeText}>Student</Text>
        </View>
      </View>

      {/* Edit/Save Buttons */}
      <View style={styles.buttonContainer}>
        {!editing ? (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarksButton}
              onPress={() => navigation.navigate('Bookmarks')}
            >
              <Text style={styles.bookmarksButtonText}>❤️ My Bookmarks</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bookmarksButton}
              onPress={() => navigation.navigate('AppliedJobs')}
            >
              <Text style={styles.bookmarksButtonText}>💼 My Applications</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profile Form */}
      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
              />
            ) : (
              <Text style={styles.value}>{fullName || 'Not set'}</Text>
            )}
          </View>

          {editing && (
            <View style={styles.field}>
              <Text style={styles.label}>Profile Picture</Text>
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
            <Text style={styles.label}>Bio</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.value}>{bio || 'No bio yet'}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Level of Study</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={levelOfStudy}
                onChangeText={setLevelOfStudy}
                placeholder="e.g. Bachelor's, Master's"
              />
            ) : (
              <Text style={styles.value}>{levelOfStudy || 'Not set'}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>CV Link</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={cvLink}
                onChangeText={setCvLink}
                placeholder="Link to your CV (Google Drive, Dropbox, etc.)"
                autoCapitalize="none"
              />
            ) : (
              <Text style={[styles.value, cvLink && styles.link]}>
                {cvLink || 'No CV link'}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Interests</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={interests}
                onChangeText={setInterests}
                placeholder="Your interests, skills, or areas of study"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.value}>{interests || 'No interests listed'}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Tip: Keep your profile updated to increase your chances of getting hired!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
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
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 5,
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af'
  },
  buttonContainer: {
    padding: 20
  },
  editButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  bookmarksButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  bookmarksButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: 'bold'
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 10
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: 'bold'
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginLeft: 10
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  form: {
    padding: 20
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10
  },
  field: {
    marginBottom: 20
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  value: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24
  },
  link: {
    color: '#2563eb'
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 15
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20
  },
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
  imagePickerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  removeImageButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 5
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
});

export default StudentProfileScreen;