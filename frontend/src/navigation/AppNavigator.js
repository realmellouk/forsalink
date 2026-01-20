// Main Navigation Setup
import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import { useUser } from '../utils/UserContext';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import JobApplicationsScreen from '../screens/Company/JobApplicationsScreen';
import EditJobScreen from '../screens/Company/EditJobScreen';
import CompanyProfileScreen from '../screens/Company/CompanyProfileScreen';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import JobDetailsScreen from '../screens/student/JobDetailsScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import BookmarksScreen from '../screens/student/BookmarksScreen';
import AppliedJobsScreen from '../screens/student/AppliedJobsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import StudentProfileView from '../screens/student/StudentProfileView'; 
// Company screens
import CompanyDashboardScreen from '../screens/Company/CompanyDashboardScreen';
import AddJobScreen from '../screens/Company/AddJobScreen';

// Common screens
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Simple icon components (using Text instead of span)
const HomeIcon = () => <Text style={{ fontSize: 24 }}>🏠</Text>;
const BellIcon = () => <Text style={{ fontSize: 24 }}>🔔</Text>;
const UserIcon = () => <Text style={{ fontSize: 24 }}>👤</Text>;
const SettingsIcon = () => <Text style={{ fontSize: 24 }}>⚙️</Text>;
const BriefcaseIcon = () => <Text style={{ fontSize: 24 }}>💼</Text>;
const PlusIcon = () => <Text style={{ fontSize: 24 }}>➕</Text>;
const BuildingIcon = () => <Text style={{ fontSize: 24 }}>🏢</Text>;

// Student Tab Navigator
const StudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb'
        }
      }}
    >
      <Tab.Screen
        name="StudentHomeScreen"
        component={StudentHomeScreen}
        options={{
          headerShown: true,
          tabBarLabel: 'Jobs',
          tabBarIcon: HomeIcon
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: BellIcon
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: UserIcon
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: SettingsIcon
        }}
      />
    </Tab.Navigator>
  );
};

// Company Tab Navigator
const CompanyTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb'
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={CompanyDashboardScreen}
        options={{
          headerShown: true,
          tabBarLabel: 'Jobs',
          tabBarIcon: BriefcaseIcon
        }}
      />
      <Tab.Screen
        name="AddJob"
        component={AddJobScreen}
        options={{
          headerShown: true,
          title: 'Post Job',
          tabBarLabel: 'Post',
          tabBarIcon: PlusIcon
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: BellIcon
        }}
      />
      <Tab.Screen
        name="CompanyProfile"
        component={CompanyProfileScreen}
        options={{
          headerShown: true,
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: BuildingIcon
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator Component
const AppNavigator = () => {
  const { user } = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens - shown when user is null
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.role === 'student' ? (
          // Student screens
          <>
            <Stack.Screen name="StudentMain" component={StudentTabs} />
            <Stack.Screen
              name="JobDetails"
              component={JobDetailsScreen}
              options={{ headerShown: true, title: 'Job Details' }}
            />
            <Stack.Screen
              name="Bookmarks"
              component={BookmarksScreen}
              options={{ headerShown: true, title: 'My Bookmarks' }}
            />
            <Stack.Screen
              name="AppliedJobs"
              component={AppliedJobsScreen}
              options={{ headerShown: true, title: 'My Applications' }}
            />
            <Stack.Screen
              name="StudentProfileView"
              component={StudentProfileView}
              options={{ headerShown: true, title: 'Student Profile' }}
            />
          </>
        ) : (
          // Company screens
          <>
            <Stack.Screen name="CompanyMain" component={CompanyTabs} />
            <Stack.Screen
              name="EditJob"
              component={EditJobScreen}
              options={{ headerShown: true, title: 'Edit Job' }}
            />
            <Stack.Screen
              name="JobApplicationsScreen"
              component={JobApplicationsScreen}
              options={{ headerShown: true, title: 'Applications' }}
            />
            <Stack.Screen
              name="StudentProfileView"
              component={StudentProfileView}
              options={{ headerShown: true, title: 'Student Profile' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;