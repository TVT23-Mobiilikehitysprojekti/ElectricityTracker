import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Keyboard } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { GEOAPIFY_KEY, OPENWEATHER_KEY } from '@env';

export default function WeatherScreen() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [manualCity, setManualCity] = useState('');
  const [showInput, setShowInput] = useState(false);

  const fetchWeather = async (cityName) => {
    const WEATHER_API_KEY = OPENWEATHER_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}`;

    try {
      const response = await axios.get(url);
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setErrorMsg('Error fetching weather data');
    }
  };

  const fetchCurrentLocationWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    try {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      if (currentLocation) {
        const { latitude, longitude } = currentLocation.coords;
        const GEOAPIFY_API_KEY = GEOAPIFY_KEY;
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`;
        
        const response = await axios.get(url);
        const cityName = response.data.features[0].properties.city || 'Unknown city';
        setCity(cityName);
        fetchWeather(cityName);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setErrorMsg('Error fetching location data');
    }
  };

  useEffect(() => {
    fetchCurrentLocationWeather();
  }, []);

  const handleManualCity = () => {
    if (manualCity.trim()) {
      setCity(manualCity);
      fetchWeather(manualCity);
      setShowInput(false);
      Keyboard.dismiss();
    } else {
      setErrorMsg('Please enter a valid city name');
    }
  };

  return (
    <View style={styles.container}>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : city && weather ? (
        <Text style={styles.info}>
          {`City: ${city}\n`}
          {`Weather: ${weather.weather[0].description}\n`}
          {`Temperature: ${(weather.main.temp - 273.15).toFixed(2)}°C`}
        </Text>
      ) : (
        <Text style={styles.info}>Fetching data...</Text>
      )}

      <Button title="Fetch Weather With GPS" onPress={fetchCurrentLocationWeather} />

      <TouchableOpacity style={styles.setLocationButton} onPress={() => setShowInput(!showInput)}>
        <Text style={styles.setLocationButtonText}>Set Location</Text>
      </TouchableOpacity>

      {showInput && (
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={manualCity}
          onChangeText={(text) => setManualCity(text)}
          onSubmitEditing={handleManualCity}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    width: '80%',
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 20,
  },
  setLocationButton: {
    marginVertical: 10,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  setLocationButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
