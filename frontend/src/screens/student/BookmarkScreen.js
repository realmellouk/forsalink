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
import ErrorMessage from '../../components/ErrorMessage';

const BookmarksScreen = ({ navigation }) => {
    const { user } = useUser();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            setError(null);
            const data = await api.getBookmarks(user.id);
            setBookmarks(data);
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
    }
});
export default BookmarksScreen;
