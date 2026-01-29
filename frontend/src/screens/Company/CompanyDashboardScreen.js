// Company Dashboard Screen - Manage Jobs
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

const { width } = Dimensions.get('window');

const CompanyDashboardScreen = ({ navigation }) => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadJobs();
    });
    return unsubscribe;
  }, [navigation]);

  const loadJobs = async () => {
    // Safety check: don't load data if user is null (during logout)
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await api.getCompanyJobs(user.id);
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

  const handleDelete = (jobId, title) => {
    console.log(`🗑️ handleDelete called for jobId: ${jobId}, title: ${title}`);

    const performDelete = async () => {
      console.log(`⏳ Proceeding with deletion of job ID: ${jobId}`);
      try {
        const response = await api.deleteJob(jobId);
        console.log('✅ Delete response from API:', response);
        loadJobs();
        Alert.alert('Success', 'Job deleted successfully');
      } catch (error) {
        console.error('❌ Error in handleDelete:', error);
        Alert.alert('Error', `Failed to delete job: ${error.message}`);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Job',
        `Are you sure you want to delete "${title}"?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => console.log('❌ Deletion cancelled by user') },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: performDelete
          }
        ]
      );
    }
  };

  const renderJobCard = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.jobMeta}>
          <View style={[styles.statusBadge,
          item.status === 'active' ? styles.statusActive : styles.statusClosed]}>
            <Text style={styles.statusText}>
              {item.status === 'active' ? '🟢 Active' : '🔴 Closed'}
            </Text>
          </View>
          <Text style={styles.jobType}>{item.job_type}</Text>
        </View>
      </View>

      {item.location && (
        <Text style={styles.location}>📍 {item.location}</Text>
      )}

      <Text style={styles.description} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Action Buttons - Stacked for better mobile layout */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.applicationsButton}
          onPress={() => navigation.navigate('JobApplicationsScreen', {
            jobId: item.id,
            jobTitle: item.title
          })}
        >
          <Text style={styles.applicationsButtonText}>📋 Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditJob', { job: item })}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id, item.title)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <Text style={styles.welcomeText}>Welcome! 🏢</Text>
        <Text style={styles.welcomeSubtext}>{user?.full_name || 'Guest'}</Text>
      </View>

      {jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No jobs posted yet</Text>
          <Text style={styles.emptySubtext}>Create your first job posting!</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('AddJob')}
          >
            <Text style={styles.createFirstButtonText}>+ Create Job</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
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

          {/* Floating Action Button */}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddJob')}
          >
            <Text style={styles.fabIcon}>+</Text>
          </TouchableOpacity>
        </>
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
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2
  },
  welcomeSubtext: {
    fontSize: 13,
    color: '#6b7280'
  },
  listContent: {
    padding: 12,
    paddingBottom: 85
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  jobHeader: {
    marginBottom: 10
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 22
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  statusActive: {
    backgroundColor: '#d1fae5'
  },
  statusClosed: {
    backgroundColor: '#fee2e2'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600'
  },
  jobType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize'
  },
  location: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12
  },
  footer: {
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  date: {
    fontSize: 11,
    color: '#9ca3af'
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  applicationsButton: {
    flex: 1,
    backgroundColor: '#f3e8ff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  applicationsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b21a8'
  },
  editButton: {
    flex: 1,
    backgroundColor: '#dbeafe',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af'
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 20
  },
  createFirstButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold'
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 85,
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32
  }
});

export default CompanyDashboardScreen;