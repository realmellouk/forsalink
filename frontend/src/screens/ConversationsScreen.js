import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useUser } from '../utils/UserContext';
import { api } from '../config/api';

const ConversationsScreen = ({ navigation }) => {
    const { user } = useUser();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadConversations();
        });
        return unsubscribe;
    }, [navigation]);

    const loadConversations = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const data = await api.getConversations(user.id);
            setConversations(data);
        } catch (error) {
            console.error('Load conversations error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadConversations();
    };

    const renderConversationCard = ({ item }) => {
        const otherPartyName = user.role === 'student'
            ? item.company_name
            : item.student_name;

        return (
            <TouchableOpacity
                style={styles.conversationCard}
                onPress={() => navigation.navigate('Chat', {
                    conversationId: item.id,
                    otherPartyName,
                    jobTitle: item.job_title
                })}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{otherPartyName.charAt(0)}</Text>
                </View>

                <View style={styles.conversationInfo}>
                    <View style={styles.header}>
                        <Text style={styles.name} numberOfLines={1}>{otherPartyName}</Text>
                        {item.unread_count > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={styles.unreadText}>{item.unread_count}</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.jobTitle} numberOfLines={1}>
                        📋 {item.job_title}
                    </Text>

                    {item.last_message && (
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item.last_message}
                        </Text>
                    )}

                    <Text style={styles.time}>
                        {new Date(item.last_message_time).toLocaleString()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {conversations.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💬</Text>
                    <Text style={styles.emptyText}>No conversations yet</Text>
                    <Text style={styles.emptySubtext}>
                        {user?.role === 'student'
                            ? 'Chat with companies after they accept your application'
                            : 'Chat with students after accepting their applications'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversationCard}
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
    listContent: {
        padding: 12,
        paddingBottom: 85
    },
    conversationCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f3f4f6'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff'
    },
    conversationInfo: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1
    },
    unreadBadge: {
        backgroundColor: '#ef4444',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: 'center'
    },
    unreadText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold'
    },
    jobTitle: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 6
    },
    lastMessage: {
        fontSize: 13,
        color: '#4b5563',
        marginBottom: 4
    },
    time: {
        fontSize: 11,
        color: '#9ca3af'
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

export default ConversationsScreen;
