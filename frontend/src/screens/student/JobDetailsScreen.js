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
  Dimensions
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

const { width } = Dimensions.get('window');

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
    if (hasApplied) {
      Alert.alert('Already Applied', 'You have already applied to this job.');
      return;
    }

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
                setHasApplied(true);
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
          <Text style={styles.jobTitle} numberOfLines={3}>{job.title}</Text>
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

          {/* Apply Button */}
          <TouchableOpacity
            style={[styles.headerApplyButton, hasApplied && styles.appliedButton]}
            onPress={handleApply}
            disabled={applying || hasApplied}
          >
            {applying ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.headerApplyButtonText}>
                {hasApplied ? 'Applied ✓' : 'Apply Now'}
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
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Posted</Text>
            <Text style={styles.dateValue}>
              {new Date(job.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View style={styles.dateDivider} />
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Deadline</Text>
            <Text style={styles.dateValue}>
              {new Date(job.job_deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
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
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
      }
    })
  },
  companyLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 26,
    paddingHorizontal: 10
  },
  companyName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    textTransform: 'capitalize'
  },
  tagSecondary: {
    backgroundColor: '#f3f4f6'
  },
  tagTextSecondary: {
    color: '#4b5563',
    fontSize: 12
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10
  },
  salary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669'
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22
  },
  contactEmail: {
    fontSize: 13,
    color: '#2563eb',
    marginTop: 8
  },
  dateSection: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  dateItem: {
    flex: 1,
    alignItems: 'center'
  },
  dateLabel: {
    fontSize: 11,
    color: '#9ca3af',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4
  },
  dateValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500'
  },
  dateDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb'
  },
  headerApplyButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
    width: '90%',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(37,99,235,0.3)',
      }
    })
  },
  headerApplyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold'
  },
  appliedButton: {
    backgroundColor: '#10b981'
  },
  errorText: {
    fontSize: 15,
    color: '#6b7280'
  }
});

export default JobDetailsScreen;