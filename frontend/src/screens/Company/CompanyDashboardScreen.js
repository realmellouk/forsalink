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
  Alert
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

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
    Alert.alert(
      'Delete Job',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteJob(jobId);
              loadJobs();
              Alert.alert('Success', 'Job deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          }
        }
      ]
    );
  };

  const renderJobCard = ({ item }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
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
      </View>

      {item.location && (
        <Text style={styles.location}>📍 {item.location}</Text>
      )}
      
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          Posted {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View style={styles.actions}>
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
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>
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
        <Text style={styles.welcomeText}>Welcome, {user.full_name}! 🏢</Text>
        <Text style={styles.welcomeSubtext}>Manage your job postings</Text>
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
    marginBottom: 12
  },
  jobInfo: {
    flex: 1
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10
  },
  statusActive: {
    backgroundColor: '#d1fae5'
  },
  statusClosed: {
    backgroundColor: '#fee2e2'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  jobType: {
    fontSize: 13,
    color: '#6b7280',
    textTransform: 'capitalize'
  },
  location: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10
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
  actions: {
    flexDirection: 'row'
  },
  editButton: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af'
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  deleteButtonText: {
    fontSize: 16
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
    marginBottom: 20
  },
  createFirstButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  createFirstButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default CompanyDashboardScreen;