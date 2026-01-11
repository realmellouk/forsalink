import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View
} from 'react-native';

const Button = ({
    onPress,
    title,
    variant = 'primary',
    loading = false,
    style,
    textStyle,
    disabled = false
}) => {
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading || disabled}
            activeOpacity={0.7}
            style={[
                styles.button,
                isOutline ? styles.outlineButton : styles.primaryButton,
                (loading || disabled) && styles.disabledButton,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={isOutline ? '#2563eb' : '#ffffff'}
                    size="small"
                />
            ) : (
                <Text style={[
                    styles.text,
                    isOutline ? styles.outlineText : styles.primaryText,
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        minHeight: 50,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#2563eb',
    },
    disabledButton: {
        opacity: 0.6,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    primaryText: {
        color: '#ffffff',
    },
    outlineText: {
        color: '#2563eb',
    }
});

export default Button;
