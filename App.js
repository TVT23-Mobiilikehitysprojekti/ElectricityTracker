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
import Menu from './components/Menu';
import { useElectricityPriceWatcher } from './hooks/useElectricityPriceWatcher';
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
  const [isMenuVisible, setMenuVisible] = useState(false);
  const userLimits = useElectricityPriceWatcher();

  useEffect(() => {
    registerForPushNotificationsAsync();
    registerBackgroundTask();
    (async () => {
      const ready = await executeTask('https://electricitytracker-backend.onrender.com/huggingface/summarize');
      console.log(ready ? 'Task executed' : 'Task not executed');
    })();
}, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
            name="SwipeableTabs"
            component={SwipeableTabs}
            options={{
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => setMenuVisible(true)}
                  style={styles.menuButton}
                >
                  <Text style={styles.menuButtonText}>Menu</Text>
                </TouchableOpacity>
              ),
              headerTitle: 'Electricity Tracer', 
            }}
          />
      </Stack.Navigator>
      <Menu isVisible={isMenuVisible} setVisible={setMenuVisible} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginRight: 10,
    padding: 5,
    backgroundColor: '#007AFF',
    minWidth: 70,
    paddingVertical: 7,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButtonText: {
    color: 'white',
    fontSize: 18,
  },
});
