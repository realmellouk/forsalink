import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const JobFilters = ({ filters, onFilterChange, onReset }) => {
    const jobTypes = ['all', 'internship', 'part-time', 'full-time'];
    const sortOptions = [
        { label: 'Latest', value: 'date_desc' },
        { label: 'Oldest', value: 'date_asc' }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🔍 Filters</Text>
                <TouchableOpacity onPress={onReset}>
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            {/* Job Type Filter */}
            <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Job Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.filterRow}>
                        {jobTypes.map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.filterChip,
                                    filters.jobType === type && styles.filterChipActive
                                ]}
                                onPress={() => onFilterChange('jobType', type)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    filters.jobType === type && styles.filterChipTextActive
                                ]}>
                                    {type === 'all' ? 'All Jobs' : type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </View>

            {/* Sort Filter */}
            <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Sort By</Text>
                <View style={styles.filterRow}>
                    {sortOptions.map(option => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.filterChip,
                                filters.sort === option.value && styles.filterChipActive
                            ]}
                            onPress={() => onFilterChange('sort', option.value)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                filters.sort === option.value && styles.filterChipTextActive
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    resetText: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '600'
    },
    filterSection: {
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    filterChip: {
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#f3f4f6'
    },
    filterChipActive: {
        backgroundColor: '#dbeafe',
        borderColor: '#2563eb'
    },
    filterChipText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    filterChipTextActive: {
        color: '#1e40af'
    }
});

export default JobFilters;