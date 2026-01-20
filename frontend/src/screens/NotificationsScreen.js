import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useUser } from '../utils/UserContext';
import { api } from '../config/api';

const NotificationsScreen = ({ navigation }) => {
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

  const handleNotificationPress = (notification) => {
    // Check if notification is about an application
    if (notification.message.includes('applied to')) {
      // Extract job title from message (format: "Student Name applied to 'Job Title'")
      const match = notification.message.match(/"([^"]+)"/);
      if (match) {
        const jobTitle = match[1];
        // Find the job and navigate to applications
        // For now, just navigate to dashboard
        if (user.role === 'company') {
          navigation.navigate('CompanyMain', { screen: 'Dashboard' });
        }
      }
    } else if (notification.message.includes('application for')) {
      // Student notification about application status
      if (user.role === 'student') {
        navigation.navigate('StudentMain', { screen: 'Home' });
      }
    }
  };

  const renderItem = ({ item }) => {
    const isApplicationNotif = item.message.includes('applied to') || item.message.includes('application for');
    
    return (
      <TouchableOpacity 
        style={[styles.notifCard, !item.is_read && styles.unread]}
        onPress={() => handleNotificationPress(item)}
        disabled={!isApplicationNotif}
      >
        <Text style={styles.icon}>
          {item.message.includes('accepted') ? '✅' : 
           item.message.includes('not successful') ? '❌' : 
           item.message.includes('applied') ? '📝' : '🔔'}
        </Text>
        <View style={styles.content}>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
        </View>
        {isApplicationNotif && (
          <Text style={styles.arrow}>→</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList 
          data={notifications} 
          renderItem={renderItem} 
          keyExtractor={i => i.id.toString()} 
          contentContainerStyle={styles.list} 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  list: { padding: 15 },
  notifCard: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  unread: { 
    backgroundColor: '#eff6ff', 
    borderLeftWidth: 4, 
    borderLeftColor: '#2563eb' 
  },
  icon: { fontSize: 24, marginRight: 12 },
  content: { flex: 1 },
  message: { fontSize: 15, color: '#1f2937', marginBottom: 5 },
  date: { fontSize: 12, color: '#9ca3af' },
  arrow: { fontSize: 20, color: '#2563eb', marginLeft: 10 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 18, color: '#6b7280' }
});

export default NotificationsScreen;