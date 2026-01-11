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
  Platform
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';
import ErrorMessage from '../../components/ErrorMessage';
import JobFilters from '../../components/JobFilters';

const StudentHomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
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
    try {
      setError(null);
      const [jobsData, bookmarksData] = await Promise.all([
        api.getJobs(),
        api.getBookmarks(user.id)
      ]);
      setJobs(jobsData);
      setBookmarks(bookmarksData.map(b => b.job_id));
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
              <Text style={styles.companyName}>{item.company_name}</Text>
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
        <Text style={styles.welcomeText}>Welcome, {user.full_name}! 👋</Text>
        <Text style={styles.welcomeSubtext}>Find your next opportunity</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, companies, locations..."
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
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </Text>
      </View>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={require('../../../assets/empty-jobs.png')}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>No jobs found</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || filters.jobType !== 'all'
              ? 'Try adjusting your filters'
              : 'Check back soon for new opportunities!'}
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
    fontSize: 14,
    color: '#6b7280'
  },
  welcomeHeader: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 15,
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
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
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
    paddingHorizontal: 15,
    marginRight: 10
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingVertical: 12
  },
  clearIcon: {
    fontSize: 18,
    color: '#9ca3af',
    paddingLeft: 10
  },
  filterButton: {
    width: 45,
    height: 45,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButtonActive: {
    backgroundColor: '#dbeafe'
  },
  filterButtonText: {
    fontSize: 20
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff'
  },
  resultsText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600'
  },
  listContent: {
    padding: 15,
    paddingBottom: 30
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }
    }),
    borderWidth: 1,
    borderColor: '#f3f4f6'
  },
  jobCardContent: {
    padding: 20
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
  bookmarkButton: {
    padding: 5
  },
  bookmarkIcon: {
    fontSize: 24
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
    padding: 20
  },
  emptyImage: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
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