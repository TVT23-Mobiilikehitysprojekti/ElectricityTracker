import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ActivityIndicator,Switch, TouchableOpacity } from 'react-native';
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

      <View style={styles.settingItem}>
        <Text style={styles.label}>Ilmoitukset</Text>
          <Switch
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={notificationsEnabled ? "#fafafa" : "#f4f3f4"}
            onValueChange={notification_setting}
            value={notificationsEnabled}
          />
      </View>

      <View style={styles.settingItem2}>
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
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveLowerLimit}>
              <Text style={styles.saveButtonText}>Tallenna</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => {
            setTemporaryLowerLimit(userLimits.lowerLimit.toString());
            setIsEditingLowerLimit(true);
          }}>
            <Text style={styles.editButtonText}>Muuta</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.settingItem2}>
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
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveUpperLimit}>
              <Text style={styles.saveButtonText}>Tallenna</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => {
            setTemporaryUpperLimit(userLimits.upperLimit.toString());
            setIsEditingUpperLimit(true);
          }}>
            <Text style={styles.editButtonText}>Muuta</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
  },
  limitsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    marginVertical: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    color: "#333",
  },
  settingItem2: {
    marginVertical: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center',
  },
  editButton: {
    backgroundColor: '#007bff', 
    paddingVertical: 12,       
    paddingHorizontal: 20,    
    borderRadius: 8,          
    alignItems: 'center',      
    width: '100%',            
    marginTop: 10,             
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#28a745', 
    paddingVertical: 12,       
    paddingHorizontal: 20,    
    borderRadius: 8,          
    alignItems: 'center',      
    width: '100%',            
    marginTop: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
