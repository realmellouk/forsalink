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
    Platform
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';
import ErrorMessage from '../../components/ErrorMessage';

const BookmarksScreen = ({ navigation }) => {
    const { user } = useUser();
    const [bookmarks, setBookmarks] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            setError(null);
            const [bookmarksData, appsData] = await Promise.all([
                api.getBookmarks(user.id),
                api.getUserApplications(user.id)
            ]);
            setBookmarks(bookmarksData);
            setApplications(appsData.map(a => a.job_id));
        } catch (err) {
            console.error('Load bookmarks error:', err);
            setError(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const removeBookmark = async (jobId) => {
        try {
            await api.removeBookmark(user.id, jobId);
            setBookmarks(prev => prev.filter(item => item.job_id !== jobId));
        } catch (err) {
            console.error('Remove bookmark error:', err);
        }
    };

    const handleApply = async (jobId, jobTitle) => {
        if (applications.includes(jobId)) {
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
        } else {
            Alert.alert(
                'Apply to this job?',
                `Submit your application for "${jobTitle}"?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Apply',
                        onPress: async () => {
                            await submitBookmarkApplication(jobId, jobTitle);
                        }
                    }
                ]
            );
            return;
        }

        if (confirmed) {
            await submitBookmarkApplication(jobId, jobTitle);
        }
    };

    const submitBookmarkApplication = async (jobId, jobTitle) => {
        try {
            await api.applyToJob(jobId, user.id);
            setApplications(prev => [...prev, jobId]);
            if (Platform.OS === 'web') {
                window.alert('Success! Your application has been submitted.');
            } else {
                Alert.alert('Success!', 'Your application has been submitted.');
            }
        } catch (err) {
            console.error('Apply error:', err);
            if (Platform.OS === 'web') {
                window.alert(`Error: ${err.message || 'Failed to submit application. Please try again.'}`);
            } else {
                Alert.alert('Error', err.message || 'Failed to submit application. Please try again.');
            }
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadBookmarks();
    };

    const renderJobCard = ({ item }) => (
        <View style={styles.jobCard}>
            <TouchableOpacity
                style={styles.jobCardContent}
                onPress={() => navigation.navigate('JobDetails', { jobId: item.job_id })}
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
                        onPress={() => removeBookmark(item.job_id)}
                    >
                        <Text style={styles.bookmarkIcon}>❤️</Text>
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
                    <Text style={styles.salaryText}>💰 {item.salary}</Text>
                )}

                <View style={styles.cardFooter}>
                    {applications.includes(item.job_id) ? (
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
                                // Delay to allow button to blur before showing alert
                                setTimeout(() => {
                                    handleApply(item.job_id, item.title);
                                }, 50);
                            }}
                        >
                            <Text style={styles.applyButtonText}>Apply Now</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading bookmarks...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <ErrorMessage
                error={error}
                onRetry={() => { setLoading(true); loadBookmarks(); }}
            />
        );
    }

    return (
        <View style={styles.container}>
            {bookmarks.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>❤️</Text>
                    <Text style={styles.emptyText}>No saved jobs yet</Text>
                    <Text style={styles.emptySubtext}>
                        Tap the heart icon on any job to save it here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={bookmarks}
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
    listContent: {
        padding: 15,
        paddingBottom: 30
    },
    jobCard: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
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
    salaryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
        marginTop: 8
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
    },
    cardFooter: {
        marginTop: 15,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        alignItems: 'flex-end'
    },
    applyButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2
    },
    applyButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: 'bold'
    },
    appliedTag: {
        backgroundColor: '#ecfdf5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#10b981'
    },
    appliedTagText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10b981'
    }
});
export default BookmarksScreen;
