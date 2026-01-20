import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking
} from 'react-native';
import { api } from '../../config/api';

const JobApplicationsScreen = ({ route, navigation }) => {
  const { jobId, jobTitle } = route.params;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await api.getJobApplicationsScreen(jobId);
      setApplications(data);
    } catch (error) {
      console.error('Load applications error:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, status, studentName) => {
    const action = status === 'accepted' ? 'Accept' : 'Reject';
    const message = `Are you sure you want to ${action.toLowerCase()} ${studentName}'s application?`;

    if (typeof window !== 'undefined' && window.confirm) {
      if (!window.confirm(message)) return;
    } else {
      Alert.alert(`${action} Application`, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: action, style: status === 'accepted' ? 'default' : 'destructive', onPress: () => updateStatus() }
      ]);
      return;
    }

    updateStatus();

    async function updateStatus() {
      try {
        await api.updateApplicationStatus(applicationId, status);
        Alert.alert('Success', `Application ${status}!`);
        loadApplications(); // Reload to show updated status
      } catch (error) {
        Alert.alert('Error', 'Failed to update application status');
      }
    }
  };

  const openCV = (cvLink) => {
    if (cvLink) {
      Linking.openURL(cvLink).catch(() => {
        Alert.alert('Error', 'Could not open CV link');
      });
    } else {
      Alert.alert('No CV', 'Student has not provided a CV link');
    }
  };

  // Navigate to student profile view
  const viewStudentProfile = (student) => {
    navigation.navigate('StudentProfileView', {
      studentId: student.user_id || student.id,
      studentData: student
    });
  };

  const renderApplication = ({ item }) => (
    <View style={styles.applicationCard}>
      {/* Student Info - Make it clickable */}
      <TouchableOpacity
        style={styles.studentHeader}
        onPress={() => viewStudentProfile(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.full_name ? item.full_name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.full_name || 'Unknown'}</Text>
          <Text style={styles.studentEmail}>{item.email || 'No email'}</Text>
          <Text style={styles.viewProfileHint}>Tap to view full profile →</Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'accepted' && styles.statusAccepted,
          item.status === 'rejected' && styles.statusRejected,
          item.status === 'pending' && styles.statusPending
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'accepted' ? '✅ Accepted' :
              item.status === 'rejected' ? '❌ Rejected' :
                '⏳ Pending'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Student Details */}
      {item.level_of_study && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📚 Level:</Text>
          <Text style={styles.detailValue}>{item.level_of_study}</Text>
        </View>
      )}

      {item.bio && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>💡 Bio:</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {item.bio}
          </Text>
        </View>
      )}

      {item.interests && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🎯 Interests:</Text>
          <Text style={styles.detailValue} numberOfLines={2}>
            {item.interests}
          </Text>
        </View>
      )}

      {item.applied_at && (
        <Text style={styles.appliedDate}>
          Applied on {new Date(item.applied_at).toLocaleDateString()}
        </Text>
      )}

      {/* CV Link */}
      {item.cv_link && (
        <TouchableOpacity style={styles.cvButton} onPress={() => openCV(item.cv_link)}>
          <Text style={styles.cvButtonText}>📄 View CV</Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      {item.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => handleStatusUpdate(item.id, 'rejected', item.full_name || 'this student')}
          >
            <Text style={styles.rejectButtonText}>❌ Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => handleStatusUpdate(item.id, 'accepted', item.full_name || 'this student')}
          >
            <Text style={styles.acceptButtonText}>✅ Accept</Text>
          </TouchableOpacity>
        </View>
      )}
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applications for:</Text>
        <Text style={styles.jobTitle}>{jobTitle}</Text>
        <Text style={styles.count}>{applications.length} application(s)</Text>
      </View>

      {applications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No applications yet</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderApplication}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 14, color: '#6b7280', marginBottom: 5 },
  jobTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 },
  count: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  listContent: { padding: 15 },
  applicationCard: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  studentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 3 },
  studentEmail: { fontSize: 14, color: '#6b7280' },
  viewProfileHint: { fontSize: 12, color: '#2563eb', marginTop: 4, fontStyle: 'italic' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  statusPending: { backgroundColor: '#fef3c7' },
  statusAccepted: { backgroundColor: '#d1fae5' },
  statusRejected: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 12, fontWeight: '600' },
  detailRow: { marginBottom: 10 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 3 },
  detailValue: { fontSize: 14, color: '#1f2937', lineHeight: 20 },
  cvButton: { backgroundColor: '#dbeafe', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  cvButtonText: { fontSize: 14, fontWeight: '600', color: '#1e40af' },
  appliedDate: { fontSize: 12, color: '#9ca3af', marginTop: 10, marginBottom: 15 },
  actions: { flexDirection: 'row', gap: 10 },
  rejectButton: { flex: 1, backgroundColor: '#fee2e2', padding: 15, borderRadius: 10, alignItems: 'center' },
  rejectButtonText: { fontSize: 15, fontWeight: 'bold', color: '#991b1b' },
  acceptButton: { flex: 1, backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center' },
  acceptButtonText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 80, marginBottom: 20 },
  emptyText: { fontSize: 18, color: '#6b7280' }
});

export default JobApplicationsScreen;