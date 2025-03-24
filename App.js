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
import Menu from './components/Menu';
import { registerForPushNotificationsAsync } from './components/notifications';

const Stack = createStackNavigator();

export default function App() {
  const [isMenuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
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
          headerBackTitleVisible: false,
          headerLeft: null,
        }}
      >
        <Stack.Screen name="MainScreen" component={MainScreen} />
        <Stack.Screen name="WeatherScreen" component={WeatherScreen} />
        <Stack.Screen name="NewsScreen" component={NewsScreen} />
        <Stack.Screen name="AiScreen" component={AiScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
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
    borderRadius: 5,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
