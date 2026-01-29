// App.js - Main Application Entry Point
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from './src/utils/UserContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <UserProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </UserProvider>
  );
}