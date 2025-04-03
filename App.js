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
import { registerForPushNotificationsAsync } from './components/notifications';
import { registerBackgroundTask } from './components/taskManager'

const Stack = createStackNavigator();

export default function App() {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const userLimits = useElectricityPriceWatcher();

  useEffect(() => {
    registerForPushNotificationsAsync();
    registerBackgroundTask();
}, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainScreen"
        screenOptions={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={styles.menuButton}
            >
              <Text style={styles.menuButtonText}>Menu</Text>
            </TouchableOpacity>
          ),
          headerTitle: '',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 22, color: 'Black' },
          headerBackTitleVisible: false,
          headerLeft: null,
        }}
      >
        <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerTitle: 'Etusivu' }} />
        <Stack.Screen name="WeatherScreen" component={WeatherScreen} options={{ headerTitle: 'Sää' }} />
        <Stack.Screen name="NewsScreen" component={NewsScreen} options={{ headerTitle: 'Uutiset' }} />
        <Stack.Screen name="AiScreen" component={AiScreen} options={{ headerTitle: 'Ai' }} />
        <Stack.Screen name="ElectricityCalculatorScreen" component={ElectricityCalculatorScreen} options={{ headerTitle: 'Laskin' }} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerTitle: 'Asetukset' }}/>
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
