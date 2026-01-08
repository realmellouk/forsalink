// Splash Screen - First screen shown
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Always navigate to login after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>💼</Text>
        <Text style={styles.title}>ForsaLink</Text>
        <Text style={styles.tagline}>Connect • Grow • Succeed</Text>
      </View>
      <Text style={styles.footer}>Bridging Students & Opportunities</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center'
  },
  logo: {
    fontSize: 80,
    marginBottom: 20
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10
  },
  tagline: {
    fontSize: 16,
    color: '#dbeafe',
    letterSpacing: 2
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    fontSize: 14,
    color: '#93c5fd'
  }
});

export default SplashScreen;