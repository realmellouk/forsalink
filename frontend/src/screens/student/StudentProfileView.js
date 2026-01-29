import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Platform,
  Alert
} from 'react-native';
import { api } from '../../config/api';

const StudentProfileView = ({ route, navigation }) => {
  const { studentId, studentData } = route.params;
  const [student, setStudent] = useState(studentData || null);
  const [loading, setLoading] = useState(!studentData);

  useEffect(() => {
    if (!studentData) {
      loadStudentProfile();
    }
  }, []);

  const loadStudentProfile = async () => {
    try {
      const data = await api.getUser(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Load student profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCV = () => {
    if (student?.cv_link) {
      Linking.openURL(student.cv_link).catch(() => {
        Alert.alert('Error', 'Could not open CV link');
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Student profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {student.full_name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{student.full_name || 'Unknown'}</Text>
        <Text style={styles.email}>{student.email || 'No email'}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Student</Text>
        </View>
      </View>

      {/* CV Button */}
      {student.cv_link && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cvButton} onPress={openCV}>
            <Text style={styles.cvButtonText}>📄 View CV</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Profile Information */}
      <View style={styles.form}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{student.full_name || 'Not provided'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <Text style={styles.value}>
              {student.bio || 'No bio provided'}
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Level of Study</Text>
            <Text style={styles.value}>
              {student.level_of_study || 'Not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Details</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Interests</Text>
            <Text style={styles.value}>
              {student.interests || 'No interests listed'}
            </Text>
          </View>

          {student.cv_link && (
            <View style={styles.field}>
              <Text style={styles.label}>CV Link</Text>
              <TouchableOpacity onPress={openCV}>
                <Text style={[styles.value, styles.link]}>
                  {student.cv_link}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {student.applied_at && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              📅 Applied on: {new Date(student.applied_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280'
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
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff'
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
  cvButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center'
  },
  cvButtonText: {
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
    color: '#2563eb',
    textDecorationLine: 'underline'
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20
  }
});

export default StudentProfileView;