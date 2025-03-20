import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { fetchElectricityPrice } from '../components/fetchElectricityPrice';

const MainScreen = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      const data = await fetchElectricityPrice();
      if (data && data.prices) {
        setPrices(data.prices.map(item => item.value / 10));
      }
      setLoading(false);
    };
    loadPrices();
  }, []);

  const getCurrentPrice = () => prices.length > 0 ? prices[new Date().getHours()].toFixed(2) : null;
  const getMinPrice = () => prices.length > 0 ? Math.min(...prices).toFixed(2) : null;
  const getMaxPrice = () => prices.length > 0 ? Math.max(...prices).toFixed(2) : null;

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={styles.container}>
      <Text>Nyt: {getCurrentPrice()} c/kWh</Text>
      <Text>Päivän alin: {getMinPrice()} c/kWh</Text>
      <Text>Päivän ylin: {getMaxPrice()} c/kWh</Text>

      <LineChart
        data={{
          labels: Array.from({ length: prices.length }, (_, i) => `${i}`),
          datasets: [{ data: prices }],
        }}
        width={350}
        height={220}
        yAxisSuffix=" c"
        chartConfig={{
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          propsForDots: {
            r: '3',
          },
        }}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default MainScreen;