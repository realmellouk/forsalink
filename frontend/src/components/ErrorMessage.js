import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ErrorMessage = ({
    message = 'Something went wrong',
    onRetry,
    icon = '⚠️'
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                    <Text style={styles.retryText}>🔄 Try Again</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f9fafb'
    },
    icon: {
        fontSize: 60,
        marginBottom: 20
    },
    message: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 24
    },
    retryButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    retryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ErrorMessage;