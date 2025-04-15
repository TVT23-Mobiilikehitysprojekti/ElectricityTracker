import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Keyboard, ScrollView, Image } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    'Vilnius', 'Piteå', 'Trondheim', 'Bergen', 'Oslo', 'Stockholm', 'Copenhagen',
    'Hamburg', 'Berlin', 'Warsaw'
  ];

  const cityTranslations = {
    Tallinn: 'Tallinna (Viro)',
    Riga: 'Riika (Latvia)',
    Vilnius: 'Vilna (Liettua)',
    Stockholm: 'Tukholma (Ruotsi)',
    Copenhagen: 'Kööpenhamina (Tanska)',
    Oslo: 'Oslo (Norja)',
    Bergen: 'Bergen (Norja)',
    Trondheim: 'Trondheim (Norja)',
    Piteå: 'Piteå (Ruotsi)',
    Hamburg: 'Hampuri (Saksa)',
    Berlin: 'Berliini (Saksa)',
    Warsaw: 'Varsova (Puola)'
  };

  const cityImages = {
    helsinki: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Helsingin_ydinkeskustaa_ja_Mannerheimintien_alkup%C3%A4%C3%A4t%C3%A4_Erottajan_paloaseman_tornista_%28cropped%29.jpg',
    turku: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/View_from_Turku_Cathedral_tower.jpg',
    tampere: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Tampere_from_Pyynikki_tower_narrow.jpg',
    vaasa: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Vaasa_kauppatori_2018.jpg',
    seinäjoki: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Sein%C3%A4joki_city_centre.jpg',
    jyväskylä: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Jyv%C3%A4skyl%C3%A4_juli_2019_15.jpg',
    lappeenranta: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Lappenranta_-_winter_-_panoramio.jpg',
    joensuu: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Ilosaari%2C_Joensuu.jpg',
    kuopio: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Kuopio_Market_Square.jpg',
    kajaani: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Kajaani_Castle_Ruins_20210421_07.jpg',
    oulu: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/View_of_Oulu_20240904_02.jpg',
    tornio: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/View_from_Suensaari_water_tower_Tornio_20150806_02.JPG',
    rovaniemi: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Rovaniemi_-The_%E2%80%9DLumberjack%27s_Candle_Bridge.jpg?20120517091014',
    tallinn: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Old_Town_of_Tallinn%2C_Tallinn%2C_Estonia_-_panoramio_%2858_cropped%29.jpg',
    riga: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/RigaSkyline_%28cropped%29.jpg',
    vilnius: 'https://upload.wikimedia.org/wikipedia/commons/6/61/Vilnius_%28Wilno%29_-_city_hall_square_%28Rotu%C5%A1%C4%97s_aik%C5%A1t%C4%97%29.JPG',
    stockholm: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Skeppsbron_20-48%2C_2006.jpg',
    copenhagen: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Nyhavn%2C_Copenhagen%2C_20220618_1726_7351.jpg',
    oslo: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Bj%C3%B8rvika_-_Oslo%2C_Norway_2020-12-23.jpg',
    bergen: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Bergen_city_centre_and_surroundings_Panorama_edited.jpg',
    trondheim: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Estaci%C3%B3n_central_de_FF.CC.%2C_Trondheim%2C_Noruega%2C_2019-09-06%2C_DD_152.jpg',
    piteå: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Centrala_Pitea_web.jpg',
    hamburg: 'https://upload.wikimedia.org/wikipedia/commons/3/34/AlsterPanorama.jpg',
    berlin: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Museumsinsel_Berlin_Juli_2021_1_%28cropped%29_b.jpg',
    warsaw: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Aleja_Niepdleglosci_Warsaw_2022_aerial_%28cropped%29.jpg'
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
      console.log('Error fetching weather for cities');
    }
  };

  const fetchCurrentLocationWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
  
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
  
      if (currentLocation) {
        const { latitude, longitude } = currentLocation.coords;
        const url = `https://electricitytracker-backend.onrender.com/api/location?latitude=${latitude}&longitude=${longitude}`;
        console.log(url);
  
        const response = await axios.get(url);
        const cityName = response.data.city || 'Unknown city';
  
        await AsyncStorage.setItem('userCity', cityName);
        setCity(cityName);
        fetchWeather(cityName);
      }
    } catch (error) {
      console.log('Error fetching location or saving city');
    }
  };
  
  
  
  const getCityName = (city) => {
    return cityTranslations[city] || city;
  };

  const handleManualCity = async () => {
    if (manualCity.trim()) {
      setCity(manualCity);
      fetchWeather(manualCity);
      setShowInput(false);
      Keyboard.dismiss();
  
      try {
        await AsyncStorage.setItem('userCity', manualCity.trim());
      } catch (error) {
        console.error('Error saving manual city:', error);
      }
    } else {
      console.log('Please enter a valid city name');
    }
  };
  

  const handleCityClick = (cityData) => {
    setSelectedCity(cityData.city);
    setModalVisible(true);
  };

  const checkAndFetchCity = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('userCity');
      if (savedCity) {
        console.log('City found in storage:', savedCity);
        setCity(savedCity);
        fetchWeather(savedCity);
      } else {
        console.log('No city found in storage, fetching location...');
        fetchCurrentLocationWeather();
      }
    } catch (error) {
      console.error('Error checking or fetching city:', error);
    }
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

  useEffect(() => {
    checkAndFetchCity();
    fetchWeatherForCities();
  }, []);  

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
              <Text style={styles.userCityText}>{`${weatherData.weather}`}</Text>
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
            Kylmä sää Suomessa tai ulkomailla voi lisätä sähkön kysyntää markkinoilla. Tuulennopeus voi vaikuttaa uusiutuvan energian saatavuuteen.
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
                    <Text style={styles.boxText}>{`${cityData.weather}`}</Text>
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
