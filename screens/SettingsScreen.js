import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useElectricityPriceWatcher } from '../hooks/useElectricityPriceWatcher';
import { triggerNotification } from '../utils/notifications';

export default function SettingsScreen() {
  const { userLimits, saveLimits, isLoading } = useElectricityPriceWatcher();
  const [isEditingLowerLimit, setIsEditingLowerLimit] = useState(false);
  const [isEditingUpperLimit, setIsEditingUpperLimit] = useState(false);
  const [temporaryLowerLimit, setTemporaryLowerLimit] = useState('');
  const [temporaryUpperLimit, setTemporaryUpperLimit] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadNotificationState = async () => {
      try {
        const storedState = await AsyncStorage.getItem('notificationsEnabled');
        if (storedState !== null) {
          setNotificationsEnabled(JSON.parse(storedState));
        }
      } catch (error) {
        console.error('Error loading notifications state:', error);
      }
    };

    loadNotificationState();
  }, []);

  const handleSaveLowerLimit = () => {
    if (temporaryLowerLimit !== '') {
      saveLimits({ lowerLimit: parseFloat(temporaryLowerLimit) });
    }
    setIsEditingLowerLimit(false);
  };

  const handleSaveUpperLimit = () => {
    if (temporaryUpperLimit !== '') {
      saveLimits({ upperLimit: parseFloat(temporaryUpperLimit) });
    }
    setIsEditingUpperLimit(false);
  };

  const notification_setting = async () => {
    try {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving notifications state:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asetukset</Text>

      <Button title="Test Notification" onPress={() => { triggerNotification(notificationsEnabled); }} />

      <Text style={styles.description}>
        Voit asettaa sähkön hinnalle rajat joiden ylittämisestä saat ilmoituksen.
      </Text>

      <View style={styles.toggleButtonContainer}>
        <Button
          title={notificationsEnabled ? "Ilmoitukset päällä" : "Ilmoitukset pois päältä"}
          onPress={notification_setting}
          color={notificationsEnabled ? '#28a745' : '#dc3545'}
        />
      </View>

      <View style={styles.limitsContainer}>
        <Text style={styles.label}>
          Alaraja: {userLimits.lowerLimit.toFixed(2)} c/kWh
        </Text>
        {isEditingLowerLimit ? (
          <>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={temporaryLowerLimit}
              onChangeText={setTemporaryLowerLimit}
              placeholder="Alaraja"
            />
            <Button title="Tallenna" onPress={handleSaveLowerLimit} />
          </>
        ) : (
          <Button
            title="Muuta"
            onPress={() => {
              setTemporaryLowerLimit(userLimits.lowerLimit.toString());
              setIsEditingLowerLimit(true);
            }}
          />
        )}
      </View>

      <View style={styles.limitsContainer}>
        <Text style={styles.label}>
          Yläraja: {userLimits.upperLimit.toFixed(2)} c/kWh
        </Text>
        {isEditingUpperLimit ? (
          <>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={temporaryUpperLimit}
              onChangeText={setTemporaryUpperLimit}
              placeholder="Yläraja"
            />
            <Button title="Tallenna" onPress={handleSaveUpperLimit} />
          </>
        ) : (
          <Button
            title="Muuta"
            onPress={() => {
              setTemporaryUpperLimit(userLimits.upperLimit.toString());
              setIsEditingUpperLimit(true);
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
  },
  toggleButtonContainer: {
    marginBottom: 20,
    width: '60%',
  },
  limitsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '80%',
    textAlign: 'center',
  },
});
