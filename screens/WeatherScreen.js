import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Keyboard, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import MapModal from '../components/mapModal';

export default function WeatherScreen() {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [manualCity, setManualCity] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [citiesWeather, setCitiesWeather] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const cities = [
    'Helsinki', 'Turku', 'Tampere', 'Vaasa', 'Seinäjoki', 'Jyväskylä', 'Lappeenranta',
    'Joensuu', 'Kuopio', 'Kajaani', 'Oulu', 'Tornio', 'Rovaniemi', 'Tallinn', 'Riga',
    'Vilnius', 'Stockholm', 'Copenhagen', 'Oslo', 'Hamburg', 'Berlin', 'Cologne', 
    'Stuttgart', 'Warsaw', 'Vienna', 'Paris', 'Rotterdam'
  ];

  const cityImages = {
    helsinki: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Helsingin_ydinkeskustaa_ja_Mannerheimintien_alkup%C3%A4%C3%A4t%C3%A4_Erottajan_paloaseman_tornista_%28cropped%29.jpg',
    turku: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/View_from_Turku_Cathedral_tower.jpg',
    tampere: '',
    vaasa: '',
    seinäjoki: '',
    jyväskylä: '',
    lappeenranta: '',
    joensuu: '',
    kuopio: '',
    kajaani: '',
    oulu: '',
    tornio: '',
    rovaniemi: '',
    tallinn: '',
    riga: '',
    vilnius: '',
    stockholm: '',
    copenhagen: '',
    oslo: '',
    hamburg: '',
    berlin: '',
    cologne: '',
    stuttgart: '',
    warsaw: '',
    vienna: '',
    paris: '',
    rotterdam: '',
  };

  const cityTranslations = {
    Tallinn: 'Tallinna (Viro)',
    Riga: 'Riika (Latvia)',
    Vilnius: 'Vilna (Liettua)',
    Stockholm: 'Tukholma (Ruotsi)',
    Copenhagen: 'Kööpenhamina (Tanska)',
    Oslo: 'Oslo (Norja)',
    Hamburg: 'Hampuri (Saksa)',
    Berlin: 'Berliini (Saksa)',
    Cologne: 'Köln (Saksa)',
    Stuttgart: 'Stuttgart (Saksa)',
    Warsaw: 'Varsova (Puola)',
    Vienna: 'Wien (Itävalta)',
    Paris: 'Pariisi (Ranska)',
    Rotterdam: 'Rotterdam (Alankomaat)'
  };

  const weatherTranslations = {
    "clear sky": "Selkeä taivas",
    "few clouds": "Vähän pilviä",
    "scattered clouds": "Hajanaisia pilviä",
    "broken clouds": "Rikkinäisiä pilviä",
    "overcast clouds": "Pilvistä",
    "light rain": "Kevyt sade",
    "moderate rain": "Kohtalainen sade",
    "heavy intensity rain": "Voimakas sade",
    "shower rain": "Sadekuuroja",
    "freezing rain": "Jäätävää sadetta",
    "light snow": "Kevyttä lumisadetta",
    "heavy snow": "Voimakasta lumisadetta",
    "sleet": "Räntäsadetta",
    "thunderstorm with light rain": "Ukkosmyrsky ja kevyt sade",
    "thunderstorm with heavy rain": "Ukkosmyrsky ja voimakas sade",
    "thunderstorm with hail": "Ukkosmyrsky ja rakeita",
    "mist": "Sumua",
    "fog": "Sumua",
  };

  const fetchWeather = async (cityName) => {
    try {
      const url = `https://electricitytracker-backend.onrender.com/api/weather?city=${encodeURIComponent(cityName)}`;
      console.log(url);
  
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response && response.data && response.data.length > 0) {
        const cityWeather = response.data[0];
        setWeatherData({
          city: cityWeather.city || "Unknown",
          temperature: cityWeather.temperature || "N/A",
          windSpeed: cityWeather.windSpeed || "N/A",
          weather: cityWeather.weather || "N/A",
        });
      } else {
        throw new Error('No valid data in the response');
      }
    } catch (error) {
      console.error('Error fetching weather for city:', error.response?.data || error.message);
  
      setWeatherData({
        city: "Unknown",
        temperature: "N/A",
        windSpeed: "N/A",
        weather: "N/A",
      });
    }
  };  

  const fetchWeatherForCities = async () => {
    try {
      const citiesQuery = encodeURIComponent(cities.join(','));
      const url = `https://electricitytracker-backend.onrender.com/api/weather?cities=${citiesQuery}`;
      console.log(url);
  
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response && response.data) {
        const weatherDataCities = response.data.map((cityWeather) => ({
          city: cityWeather.city || "Unknown",
          temperature: cityWeather.temperature || "N/A",
          windSpeed: cityWeather.windSpeed || "N/A",
          weather: cityWeather.weather || "N/A",
        }));
        setCitiesWeather(weatherDataCities);
      } else {
        throw new Error('No data in the response');
      }
    } catch (error) {
      console.error('Error fetching weather for cities:', error.response?.data || error.message);
    }
  };

  const fetchCurrentLocationWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
    }

    try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        if (currentLocation) {
            const { latitude, longitude } = currentLocation.coords;
            const url = `https://electricitytracker-backend.onrender.com/api/location?latitude=${latitude}&longitude=${longitude}`;
            console.log(url);
            
            const response = await axios.get(url);
            const cityName = response.data.city || 'Unknown city';
            setCity(cityName);
            fetchWeather(cityName);
        }
    } catch (error) {
        console.error('Error fetching location:', error);
    }
  };
  
  const getCityName = (city) => {
    return cityTranslations[city] || city;
  };

  const getWeatherTranslation = (weather) => {
    const normalizedWeather = weather.toLowerCase();
    return weatherTranslations[normalizedWeather] || weather;
  };

  const getCityImage = (cityName) => {
    const cityKey = cityName.toLowerCase();
    return cityImages[cityKey] || cityImages.default;
  };

  useEffect(() => {
    fetchCurrentLocationWeather();
    fetchWeatherForCities();
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

    const handleCityClick = (cityData) => {
      setSelectedCity(cityData.city);
      setModalVisible(true);
    };

    const CityImageComponent = ({ city }) => {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={
              cityImages[city?.toLowerCase()]
                ? { uri: cityImages[city?.toLowerCase()] }
                : require('./img/default.jpg')
            }
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      );
    };    

    return (
      <View style={styles.container}>
        {errorMsg ? (
          <Text style={styles.error}>{errorMsg}</Text>
        ) : (
          <>
            {weatherData && (
              <View style={styles.userCityWeatherContainer}>
                <Text style={styles.userCityText}>{`Sijaintisi: ${getCityName(weatherData.city)}`}</Text>
                <Text style={styles.userCityText}>{`${weatherData.temperature}°C`},  {`${weatherData.windSpeed} m/s`}</Text>
                <Text style={styles.userCityText}>{`${getWeatherTranslation(weatherData.weather)}`}</Text>
              </View>
            )}
  
            <Button title="Käytä laitteen sijaintia" onPress={fetchCurrentLocationWeather} />
  
            <TouchableOpacity style={styles.setLocationButton} onPress={() => setShowInput(!showInput)}>
              <Text style={styles.setLocationButtonText}>Aseta sijainti</Text>
            </TouchableOpacity>
  
            {showInput && (
              <TextInput
                style={styles.input}
                placeholder="Kaupungin nimi"
                value={manualCity}
                onChangeText={(text) => setManualCity(text)}
                onSubmitEditing={handleManualCity}
              />
            )}
  
            <Text style={styles.infoText}>
              Sääolosuhteet voivat vaikuttaa pörssisähkön hintaan lämmityskustannusten ja uusiutuvan energian saatavuuden kautta.
            </Text>

            {citiesWeather.length > 0 && (
              <ScrollView style={styles.scrollContainer}>
                {citiesWeather.map((cityData) => (
                  <TouchableOpacity 
                    key={cityData.city} 
                    style={styles.weatherBox} 
                    onPress={() => handleCityClick(cityData)}
                  >
                    <View style={styles.textContainer}>
                      <Text style={styles.boxText}>{`${getCityName(cityData.city)}`}</Text>
                      <Text style={styles.boxText}>{`${cityData.temperature}°C`}, {`${cityData.windSpeed} m/s`}</Text>
                      <Text style={styles.boxText}>{`${getWeatherTranslation(cityData.weather)}`}</Text>
                    </View>
                    <View style={styles.imageContainer}>
                      <CityImageComponent city={cityData.city} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
  
            <MapModal
              isVisible={isModalVisible}
              onClose={() => setModalVisible(false)}
              cityName={selectedCity}
            />
          </>
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
    padding: 20,
  },
  scrollContainer: {
    marginTop: 20,
    width: '100%',
  },
  weatherBox: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  imageContainer: {
    width: 176,
    height: 58,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  userCityWeatherContainer: {
    padding: 15,
    marginBottom: 20,
  },
  boxText: {
    fontSize: 16,
  },
  userCityText: {
    fontSize: 20,
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
