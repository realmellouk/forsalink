import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  Platform,
  Dimensions
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';
import ErrorMessage from '../../components/ErrorMessage';
import JobFilters from '../../components/JobFilters';

const { width } = Dimensions.get('window');

const StudentHomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    jobType: 'all',
    sort: 'date_desc'
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters, searchQuery, bookmarks]);

  const loadData = async () => {
    // Safety check: don't load data if user is null (during logout)
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const [jobsData, bookmarksData, appsData] = await Promise.all([
        api.getJobs(),
        api.getBookmarks(user.id),
        api.getUserApplications(user.id)
      ]);

      console.log('📊 Raw applications data from API:', appsData);
      const appIds = appsData.map(a => a.job_id);
      console.log('📊 Mapped application IDs:', appIds);

      setJobs(jobsData);
      setBookmarks(bookmarksData.map(b => b.job_id));
      setApplications(appIds);
    } catch (err) {
      console.error('Load data error:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let result = [...jobs];

    // Search filter
    if (searchQuery) {
      result = result.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Job type filter
    if (filters.jobType !== 'all') {
      result = result.filter(job => job.job_type === filters.jobType);
    }

    // Sort
    if (filters.sort === 'date_desc') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sort === 'date_asc') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    setFilteredJobs(result);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ jobType: 'all', sort: 'date_desc' });
    setSearchQuery('');
  };

  const toggleBookmark = async (jobId) => {
    try {
      if (bookmarks.includes(jobId)) {
        await api.removeBookmark(user.id, jobId);
        setBookmarks(prev => prev.filter(id => id !== jobId));
      } else {
        await api.addBookmark(user.id, jobId);
        setBookmarks(prev => [...prev, jobId]);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
      Alert.alert('Error', 'Failed to update bookmark. Please try again.');
    }
  };

  const handleApply = async (jobId, jobTitle) => {
    console.log('🔵 handleApply called with:', { jobId, jobTitle, userId: user.id });
    console.log('🔵 Current applications:', applications);

    // Prevent applying if already applied
    if (applications.includes(jobId)) {
      console.log('⚠️ Already applied to job:', jobId);
      if (Platform.OS === 'web') {
        window.alert('You have already applied to this job.');
      } else {
        Alert.alert('Already Applied', 'You have already applied to this job.');
      }
      return;
    }

    // Use platform-specific confirmation
    let confirmed = false;

    if (Platform.OS === 'web') {
      confirmed = window.confirm(`Apply to "${jobTitle}"?\n\nSubmit your application for this job?`);
      console.log('🔵 Web confirmation result:', confirmed);
    } else {
      // For mobile, use Alert.alert with callback
      Alert.alert(
        'Apply to this job?',
        `Submit your application for "${jobTitle}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Apply',
            onPress: async () => {
              await submitApplication(jobId, jobTitle);
            }
          }
        ]
      );
      return; // Exit here for mobile since callback handles it
    }

    // For web, handle confirmation result directly
    if (confirmed) {
      await submitApplication(jobId, jobTitle);
    }
  };

  const submitApplication = async (jobId, jobTitle) => {
    console.log('✅ User confirmed application');
    try {
      console.log('📤 Calling api.applyToJob with:', { jobId, userId: user.id });
      const response = await api.applyToJob(jobId, user.id);
      console.log('📥 API Response:', response);

      setApplications(prev => {
        const updated = [...prev, jobId];
        console.log('🔄 Updated applications:', updated);
        return updated;
      });

      if (Platform.OS === 'web') {
        window.alert('Success! Your application has been submitted.');
      } else {
        Alert.alert('Success!', 'Your application has been submitted.');
      }
    } catch (err) {
      console.error('❌ Apply error:', err);
      if (Platform.OS === 'web') {
        window.alert(`Error: ${err.message || 'Failed to submit application. Please try again.'}`);
      } else {
        Alert.alert('Error', err.message || 'Failed to submit application. Please try again.');
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleRetry = () => {
    setLoading(true);
    loadData();
  };

  const renderJobCard = ({ item }) => {
    const isBookmarked = bookmarks.includes(item.id);

    return (
      <View style={styles.jobCard}>
        <TouchableOpacity
          style={styles.jobCardContent}
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
              <Text style={styles.companyName} numberOfLines={1}>{item.company_name}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => toggleBookmark(item.id)}
            >
              <Text style={styles.bookmarkIcon}>
                {isBookmarked ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.jobDetails}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.job_type}</Text>
            </View>
            {item.location && (
              <Text style={styles.locationText}>📍 {item.location}</Text>
            )}
          </View>

          {item.salary && (
            <Text style={styles.salaryText}>💰 {item.salary}</Text>
          )}

          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
            {applications.includes(item.id) ? (
              <View style={styles.appliedTag}>
                <Text style={styles.appliedTagText}>Applied ✓</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.7}
                onPress={(e) => {
                  if (e && e.stopPropagation) {
                    e.stopPropagation();
                  }
                  setTimeout(() => {
                    handleApply(item.id, item.title);
                  }, 50);
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.welcomeHeader}>
        <Text style={styles.welcomeText}>Welcome! 👋</Text>
        <Text style={styles.welcomeSubtext}>{user?.full_name || 'Guest'}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? '✕' : '⚙️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <JobFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
        </Text>
      </View>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No jobs found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || filters.jobType !== 'all'
              ? 'Try adjusting your filters'
              : 'Check back soon!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
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
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6b7280'
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
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 8
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    paddingVertical: 10
  },
  clearIcon: {
    fontSize: 16,
    color: '#9ca3af',
    paddingLeft: 8
  },
  filterButton: {
    width: 42,
    height: 42,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButtonActive: {
    backgroundColor: '#dbeafe'
  },
  filterButtonText: {
    fontSize: 18
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff'
  },
  resultsText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600'
  },
  listContent: {
    padding: 12,
    paddingBottom: 85
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }
    }),
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  jobCardContent: {
    padding: 14
  },
  jobHeader: {
    flexDirection: 'row',
    marginBottom: 12
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  companyLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  jobInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
    lineHeight: 20
  },
  companyName: {
    fontSize: 12,
    color: '#6b7280'
  },
  bookmarkButton: {
    padding: 4
  },
  bookmarkIcon: {
    fontSize: 20
  },
  jobDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e40af',
    textTransform: 'capitalize'
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280'
  },
  salaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 10
  },
  description: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  date: {
    fontSize: 11,
    color: '#9ca3af'
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(37,99,235,0.3)',
      }
    })
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  appliedTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981'
  },
  appliedTagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981'
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
    textAlign: 'center'
  }
});

export default StudentHomeScreen;