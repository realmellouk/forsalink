// Job Details Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

const JobDetailsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const { user } = useUser();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);


  useEffect(() => {
    loadJobDetails();
  }, []);

  const loadJobDetails = async () => {
    try {
      const [jobData, appsData] = await Promise.all([
        api.getJob(jobId),
        api.getUserApplications(user.id)
      ]);
      setJob(jobData);
      setHasApplied(appsData.some(app => app.job_id === parseInt(jobId)));
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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

          {/* New Inline Apply Button */}
          <TouchableOpacity
            style={[styles.headerApplyButton, hasApplied && styles.appliedButton]}
            onPress={handleApply}
            disabled={applying || hasApplied}
          >
            {applying ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.headerApplyButtonText}>
                {hasApplied ? 'Status: Applied ✓' : 'Apply Now '}
              </Text>
            )}
          </TouchableOpacity>
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
          <Text style={styles.dateText}>
            Deadline {new Date(job.job_deadline).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 20
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
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
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 8px rgba(37,99,235,0.3)',
      }
    })
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'

  },
  dateText: {
    fontSize: 13,
    color: '#9ca3af'
  },
  headerApplyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 14,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 8px rgba(37,99,235,0.3)',
      }
    })
  },
  headerApplyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  appliedButton: {
    backgroundColor: '#10b981',
    opacity: 0.9
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280'
  }
});

export default JobDetailsScreen;