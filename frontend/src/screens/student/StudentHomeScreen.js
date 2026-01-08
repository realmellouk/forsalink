// Student Home Screen - Browse Jobs
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

const StudentHomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Load jobs error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadJobs();
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
    >
      <View style={styles.jobHeader}>
        <View style={styles.companyLogo}>
          <Text style={styles.companyLogoText}>
            {item.company_name.charAt(0)}
          </Text>
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company_name}</Text>
        </View>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.job_type}</Text>
        </View>
        {item.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>📍 {item.location}</Text>
          </View>
        )}
      </View>

      {item.salary && (
        <View style={styles.salaryContainer}>
          <Text style={styles.salaryText}>💰 {item.salary}</Text>
        </View>
      )}

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          Posted {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome, {user.full_name}! 👋</Text>
        <Text style={styles.welcomeSubtext}>Find your next opportunity</Text>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No jobs available yet</Text>
          <Text style={styles.emptySubtext}>Check back soon for new opportunities!</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
            />
          }
        />
      )}
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
  welcomeHeader: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#6b7280'
  },
  listContent: {
    padding: 15,
    paddingBottom: 30
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  jobHeader: {
    flexDirection: 'row',
    marginBottom: 15
  },
  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  companyLogoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  jobInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  companyName: {
    fontSize: 14,
    color: '#6b7280'
  },
  jobDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    textTransform: 'capitalize'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280'
  },
  salaryContainer: {
    marginBottom: 12
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669'
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 15
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  date: {
    fontSize: 12,
    color: '#9ca3af'
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  }
});

export default StudentHomeScreen;