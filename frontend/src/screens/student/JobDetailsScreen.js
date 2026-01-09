// Job Details Screen
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

const JobDetailsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const { user } = useUser();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  

  useEffect(() => {
    loadJobDetails();
  }, []);

  const loadJobDetails = async () => {
    try {
      const data = await api.getJob(jobId);
      setJob(data);
    } catch (error) {
      console.error('Load job error:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    Alert.alert(
      'Apply to this job?',
      'Your application will be sent to the company.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Apply',
          onPress: async () => {
            setApplying(true);
            try {
              const response = await api.applyToJob(jobId, user.id);
              
              if (response.error) {
                Alert.alert('Error', response.error);
              } else {
                Alert.alert(
                  'Success!',
                  'Your application has been submitted.',
                  [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to submit application');
            } finally {
              setApplying(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyLogo}>
            <Text style={styles.companyLogoText}>
              {job.company_name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.company_name}</Text>

          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{job.job_type}</Text>
            </View>
            {job.location && (
              <View style={[styles.tag, styles.tagSecondary]}>
                <Text style={styles.tagTextSecondary}>📍 {job.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Salary */}
        {job.salary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Compensation</Text>
            <Text style={styles.salary}>{job.salary}</Text>
          </View>
        )}

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Requirements */}
        {job.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Requirements</Text>
            <Text style={styles.description}>{job.requirements}</Text>
          </View>
        )}

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 About the Company</Text>
          <Text style={styles.description}>
            {job.company_description || 'No description available'}
          </Text>
          <Text style={styles.contactEmail}>📧 {job.company_email}</Text>
        </View>

        {/* Posted Date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>
            Posted on {new Date(job.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button (Fixed at bottom) */}
      <View style={styles.applyContainer}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={handleApply}
          disabled={applying}
        >
          {applying ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.applyButtonText}>Apply Now 🚀</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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
  scrollView: {
    flex: 1
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 25,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  companyLogo: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  companyLogoText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8
  },
  companyName: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 15
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    textTransform: 'capitalize'
  },
  tagSecondary: {
    backgroundColor: '#f3f4f6'
  },
  tagTextSecondary: {
    color: '#4b5563'
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12
  },
  salary: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669'
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24
  },
  contactEmail: {
    fontSize: 14,
    color: '#2563eb',
    marginTop: 10
  },
  dateSection: {
    padding: 20,
    alignItems: 'center'
  },
  dateText: {
    fontSize: 13,
    color: '#9ca3af'
  },
  applyContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10
  },
  applyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280'
  }
});

export default JobDetailsScreen;