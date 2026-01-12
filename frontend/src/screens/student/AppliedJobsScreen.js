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

const AppliedJobsScreen = ({ navigation }) => {
    const { user } = useUser();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            setError(null);
            const data = await api.getUserApplications(user.id);
            setApplications(data);
        } catch (err) {
            console.error('Load applications error:', err);
            setError(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadApplications();
    };

    const getStatusStyle = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted':
                return styles.statusAccepted;
            case 'rejected':
                return styles.statusRejected;
            default:
                return styles.statusPending;
        }
    };

    const renderApplicationCard = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.cardContent}
                onPress={() => navigation.navigate('JobDetails', { jobId: item.job_id })}
            >
                <View style={styles.header}>
                    <View style={styles.companyLogo}>
                        <Text style={styles.companyLogoText}>
                            {item.company_name?.charAt(0) || 'C'}
                        </Text>
                    </View>
                    <View style={styles.jobInfo}>
                        <Text style={styles.jobTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.companyName}>{item.company_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                        <Text style={[styles.statusText, { color: '#fff' }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.details}>
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>{item.job_type}</Text>
                    </View>
                    {item.location && (
                        <Text style={styles.locationText}>📍 {item.location}</Text>
                    )}
                </View>

                <Text style={styles.dateText}>
                    Applied on: {new Date(item.applied_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading applications...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <ErrorMessage
                error={error}
                onRetry={() => { setLoading(true); loadApplications(); }}
            />
        );
    }

    return (
        <View style={styles.container}>
            {applications.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💼</Text>
                    <Text style={styles.emptyText}>No applications yet</Text>
                    <Text style={styles.emptySubtext}>
                        Apply to jobs to track them here
                    </Text>
                    <TouchableOpacity
                        style={styles.exploreButton}
                        onPress={() => navigation.navigate('StudentMain', { screen: 'StudentHomeScreen' })}
                    >
                        <Text style={styles.exploreButtonText}>Explore Jobs</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={applications}
                    renderItem={renderApplicationCard}
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
    card: {
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
    cardContent: {
        padding: 20
    },
    header: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center'
    },
    companyLogo: {
        width: 45,
        height: 45,
        borderRadius: 10,
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
        justifyContent: 'center'
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 2
    },
    companyName: {
        fontSize: 13,
        color: '#6b7280'
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 10
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    statusPending: {
        backgroundColor: '#f59e0b'
    },
    statusAccepted: {
        backgroundColor: '#10b981'
    },
    statusRejected: {
        backgroundColor: '#ef4444'
    },
    details: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        flexWrap: 'wrap'
    },
    tag: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        marginRight: 10
    },
    tagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#4b5563',
        textTransform: 'capitalize'
    },
    locationText: {
        fontSize: 12,
        color: '#6b7280'
    },
    dateText: {
        fontSize: 12,
        color: '#9ca3af',
        fontStyle: 'italic'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40
    },
    emptyIcon: {
        fontSize: 70,
        marginBottom: 20
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 25
    },
    exploreButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25
    },
    exploreButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 15
    }
});

export default AppliedJobsScreen;
