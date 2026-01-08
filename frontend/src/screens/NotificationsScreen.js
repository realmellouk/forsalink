// ==================== NotificationsScreen.js ====================
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useUser } from '../utils/UserContext';
import { api } from '../config/api';

const NotificationsScreen = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.notifCard, !item.is_read && styles.unread]}>
      <Text style={styles.icon}>🔔</Text>
      <View style={styles.content}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList data={notifications} renderItem={renderItem} keyExtractor={i => i.id.toString()} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 15 },
  notifCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start' },
  unread: { backgroundColor: '#eff6ff', borderLeftWidth: 4, borderLeftColor: '#2563eb' },
  icon: { fontSize: 24, marginRight: 12 },
  content: { flex: 1 },
  message: { fontSize: 15, color: '#1f2937', marginBottom: 5 },
  date: { fontSize: 12, color: '#9ca3af' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 18, color: '#6b7280' }
});

export default NotificationsScreen;
