import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function WeatherScreen() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchCity = async (latitude, longitude) => {
    const GEOAPIFY_API_KEY = 'API_KEY';
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`;

    try {
      const response = await axios.get(url);
      const cityName = response.data.features[0].properties.city;
      return cityName || 'Unknown city';
    } catch (error) {
      console.error('Error fetching city:', error);
      setErrorMsg('Error fetching city data');
      return null;
    }
  };

  const fetchWeather = async (cityName) => {
    const WEATHER_API_KEY = 'API_KEY';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${WEATHER_API_KEY}`;

    try {
      const response = await axios.get(url);
      setWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setErrorMsg('Error fetching weather data');
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      if (currentLocation) {
        const { latitude, longitude } = currentLocation.coords;
        const cityName = await fetchCity(latitude, longitude);
        if (cityName) {
          setCity(cityName);
          fetchWeather(cityName);
        }
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weather Screen</Text>
      {errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : location && city && weather ? (
        <Text style={styles.info}>
          {`City: ${city}\n`}
          {`Weather: ${weather.weather[0].description}\n`}
          {`Temperature: ${(weather.main.temp - 273.15).toFixed(2)}°C`}
        </Text>
      ) : (
        <Text style={styles.info}>Fetching data...</Text>
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
  },
});
