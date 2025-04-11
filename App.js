import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './screens/MainScreen';
import WeatherScreen from './screens/WeatherScreen';
import NewsScreen from './screens/NewsScreen';
import AiScreen from './screens/AiScreen';
import SettingsScreen from './screens/SettingsScreen';
import ElectricityCalculatorScreen from './screens/ElectricityCalculatorScreen';
import { useElectricityPriceWatcher } from './hooks/useElectricityPriceWatcher';
import useRateLimitedTask from './hooks/useRateLimitedTask';
import { registerForPushNotificationsAsync } from './utils/notifications';
import { registerBackgroundTask } from './utils/taskManager'
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();
const SwipeableTabs = () => (
  <Tab.Navigator
  screenOptions={{
    tabBarScrollEnabled: true, 
    tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold', },
    tabBarStyle: { backgroundColor: '#f8f9fa' },
    tabBarIndicatorStyle: { backgroundColor: '#007bff', height: 3 },
  }}
>
    <Tab.Screen name="Etusivu" component={MainScreen} />
    <Tab.Screen name="Katselmus" component={AiScreen} />
    <Tab.Screen name="Laskin" component={ElectricityCalculatorScreen} />
    <Tab.Screen name="Uutiset" component={NewsScreen} />
    <Tab.Screen name="Sää" component={WeatherScreen} />
    <Tab.Screen name="Asetukset" component={SettingsScreen} />
  </Tab.Navigator>
);

export default function App() {
  const { executeTask } = useRateLimitedTask('summaryRequest')

  useEffect(() => {
    registerForPushNotificationsAsync();
    registerBackgroundTask();
    (async () => {
      console.log("Requesting /summarize route");
      const data = await executeTask('https://electricitytracker-backend.onrender.com/huggingface/summarize');
      console.log(data ? 'Summary requested successfully' : 'Requesting summary failed');
    })();
  }, [executeTask]);


  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="SwipeableTabs"
          component={SwipeableTabs}
          options={{
            headerTitle: 'Electricity Tracker', 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}