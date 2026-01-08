// Add Job Screen
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useUser } from '../../utils/UserContext';
import { api } from '../../config/api';

const AddJobScreen = ({ navigation }) => {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState('part-time');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        title,
        description,
        job_type: jobType,
        location,
        salary,
        requirements,
        company_id: user.id
      };

      const response = await api.createJob(jobData);
      
      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert(
          'Success!',
          'Job posted successfully',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setJobType('part-time');
              setLocation('');
              setSalary('');
              setRequirements('');
              // Navigate to dashboard
              navigation.navigate('Dashboard');
            }
          }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>💼</Text>
          <Text style={styles.title}>Post a New Job</Text>
          <Text style={styles.subtitle}>Fill in the details below</Text>
        </View>

        <View style={styles.form}>
          {/* Job Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Frontend Developer Intern"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Job Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Job Type *</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeOption, jobType === 'internship' && styles.typeOptionActive]}
                onPress={() => setJobType('internship')}
              >
                <Text style={[styles.typeText, jobType === 'internship' && styles.typeTextActive]}>
                  Internship
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, jobType === 'part-time' && styles.typeOptionActive]}
                onPress={() => setJobType('part-time')}
              >
                <Text style={[styles.typeText, jobType === 'part-time' && styles.typeTextActive]}>
                  Part-time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, jobType === 'full-time' && styles.typeOptionActive]}
                onPress={() => setJobType('full-time')}
              >
                <Text style={[styles.typeText, jobType === 'full-time' && styles.typeTextActive]}>
                  Full-time
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Casablanca, Remote"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Salary */}
          <View style={styles.field}>
            <Text style={styles.label}>Salary/Compensation</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3000 MAD/month"
              value={salary}
              onChangeText={setSalary}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Job Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the role, responsibilities, and what you're looking for..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
            />
          </View>

          {/* Requirements */}
          <View style={styles.field}>
            <Text style={styles.label}>Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List the required skills, qualifications, or experience..."
              value={requirements}
              onChangeText={setRequirements}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>📢 Post Job</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  content: {
    padding: 20,
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10
  },
  icon: {
    fontSize: 50,
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  field: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#1f2937'
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top'
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  typeOptionActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb'
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280'
  },
  typeTextActive: {
    color: '#1e40af'
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default AddJobScreen;