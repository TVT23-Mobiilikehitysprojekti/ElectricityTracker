import React from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const locations = [
    { name: 'Helsinki', latitude: 60.1699, longitude: 24.9384 },
    { name: 'Turku', latitude: 60.4518, longitude: 22.2666 },
    { name: 'Tampere', latitude: 61.4982, longitude: 23.7608 },
    { name: 'Vaasa', latitude: 63.096, longitude: 21.6158 },
    { name: 'Seinäjoki', latitude: 62.7904, longitude: 22.8413 },
    { name: 'Jyväskylä', latitude: 62.2426, longitude: 25.7473 },
    { name: 'Lappeenranta', latitude: 61.0583, longitude: 28.1887 },
    { name: 'Joensuu', latitude: 62.601, longitude: 29.7634 },
    { name: 'Kuopio', latitude: 62.891, longitude: 27.6782 },
    { name: 'Kajaani', latitude: 64.2273, longitude: 27.7285 },
    { name: 'Oulu', latitude: 65.0121, longitude: 25.4651 },
    { name: 'Tornio', latitude: 65.8471, longitude: 24.1466 },
    { name: 'Rovaniemi', latitude: 66.5039, longitude: 25.7294 },
    { name: 'Tallinn', latitude: 59.437, longitude: 24.7535 },
    { name: 'Riga', latitude: 56.9496, longitude: 24.1052 },
    { name: 'Vilnius', latitude: 54.6872, longitude: 25.2797 },
    { name: 'Stockholm', latitude: 59.3293, longitude: 18.0686 },
    { name: 'Copenhagen', latitude: 55.6761, longitude: 12.5683 },
    { name: 'Oslo', latitude: 59.9139, longitude: 10.7522 },
    { name: 'Hamburg', latitude: 53.5511, longitude: 9.9937 },
    { name: 'Berlin', latitude: 52.52, longitude: 13.405 },
    { name: 'Cologne', latitude: 50.9375, longitude: 6.9603 },
    { name: 'Stuttgart', latitude: 48.7758, longitude: 9.1829 },
    { name: 'Warsaw', latitude: 52.2297, longitude: 21.0122 },
    { name: 'Vienna', latitude: 48.2082, longitude: 16.3738 },
    { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Rotterdam', latitude: 51.9225, longitude: 4.4792 },
];

const MapModal = ({ isVisible, onClose, cityName }) => {
  const city = locations.find(location => location.name.toLowerCase() === cityName?.toLowerCase());

  if (!city) {
    return null;
  }

  return (
    <Modal visible={isVisible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: city.latitude,
            longitude: city.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={{
              latitude: city.latitude,
              longitude: city.longitude,
            }}
            title={city.name}
          />
        </MapView>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Takaisin</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    margin: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default MapModal;
