// ==================== EditJobScreen.js ====================

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { api } from '../../config/api';


const EditJobScreen = ({ route, navigation }) => {
  const { job } = route.params;
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [jobType, setJobType] = useState(job.job_type);
  const [location, setLocation] = useState(job.location || '');
  const [salary, setSalary] = useState(job.salary || '');
  const [requirements, setRequirements] = useState(job.requirements || '');
  const [status, setStatus] = useState(job.status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }

    setLoading(true);
    try {
      await api.updateJob(job.id, { title, description, job_type: jobType, location, salary, requirements, status });
      Alert.alert('Success', 'Job updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusToggle}>
              <TouchableOpacity style={[styles.statusButton, status === 'active' && styles.statusActive]} onPress={() => setStatus('active')}>
                <Text style={[styles.statusText, status === 'active' && styles.statusTextActive]}>🟢 Active</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton, status === 'closed' && styles.statusClosed]} onPress={() => setStatus('closed')}>
                <Text style={[styles.statusText, status === 'closed' && styles.statusTextClosed]}>🔴 Closed</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Job Type</Text>
            <View style={styles.typeSelector}>
              {['internship', 'part-time', 'full-time'].map(type => (
                <TouchableOpacity key={type} style={[styles.typeOption, jobType === type && styles.typeOptionActive]} onPress={() => setJobType(type)}>
                  <Text style={[styles.typeText, jobType === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Salary</Text>
            <TextInput style={styles.input} value={salary} onChangeText={setSalary} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline numberOfLines={6} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Requirements</Text>
            <TextInput style={[styles.input, styles.textArea]} value={requirements} onChangeText={setRequirements} multiline numberOfLines={4} />
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateButtonText}>💾 Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20 },
  form: { backgroundColor: '#fff', borderRadius: 15, padding: 20 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 15, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  statusToggle: { flexDirection: 'row' },
  statusButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 2, borderColor: '#e5e7eb', marginHorizontal: 5, alignItems: 'center' },
  statusActive: { backgroundColor: '#d1fae5', borderColor: '#10b981' },
  statusClosed: { backgroundColor: '#fee2e2', borderColor: '#ef4444' },
  statusText: { fontWeight: '600', color: '#6b7280' },
  statusTextActive: { color: '#065f46' },
  statusTextClosed: { color: '#991b1b' },
  typeSelector: { flexDirection: 'row' },
  typeOption: { flex: 1, backgroundColor: '#f9fafb', borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  typeOptionActive: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  typeText: { fontSize: 13, fontWeight: '600', color: '#6b7280', textTransform: 'capitalize' },
  typeTextActive: { color: '#1e40af' },
  updateButton: { backgroundColor: '#10b981', borderRadius: 10, padding: 18, alignItems: 'center', marginTop: 10 },
  updateButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default EditJobScreen;