import 'react-native-gesture-handler';
import React, { useState, useEffect, createContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './screens/MainScreen';
import WeatherScreen from './screens/WeatherScreen';
import NewsScreen from './screens/NewsScreen';
import AiScreen from './screens/AiScreen';
import SettingsScreen from './screens/SettingsScreen';
import ElectricityCalculatorScreen from './screens/ElectricityCalculatorScreen';
import { registerForPushNotificationsAsync } from './utils/notifications';
import { registerBackgroundTask } from './utils/taskManager';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import axios from 'axios';

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

export const AppContext = createContext();

const SwipeableTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarScrollEnabled: true,
      tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
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
  const [serverResponse, setServerResponse] = useState(false);

  const fetchSummaryWithRetry = async (url, retries = 10, delay = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Requesting ${url}`);
        const response = await axios.get(url);

        console.log('Summary requested successfully:', response.data);
        setServerResponse(true);
        return response.data;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          console.error('Rate limit hit (HTTP 429). Stopping further requests.');
          setServerResponse(true);
          return null;
        }

        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt === retries) {
          console.error('Max retries reached. Giving up.');
          setServerResponse(false);
          return null;
        }

        const nextDelay = delay * 2;
        console.log(`Retrying in ${nextDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, nextDelay));
      }
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync();
    registerBackgroundTask();

    fetchSummaryWithRetry('https://electricitytracker-backend.onrender.com/huggingface/summarize');
  }, []);

  return (
    <AppContext.Provider value={{ serverResponse, setServerResponse }}>
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
    </AppContext.Provider>
  );  
}
