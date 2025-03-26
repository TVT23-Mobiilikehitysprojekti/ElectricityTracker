import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Button } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { fetchElectricityPrice, fetchElectricityPriceHistory } from "../components/fetchElectricityPrice";

const MainScreen = () => {
  const dateLabels = (days) => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      if (i % 5 === 0) {
        dates.push(`${date.getDate()}.${date.getMonth() + 1}.`);
      } else {
        dates.push("");
      }
    }
    return dates;
  };

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [priceTrend, setPricetrend] = useState("");

  useEffect(() => {
    if (prices.length > 0) {
      setPricetrend(electricityTrend(prices));
    }
  }, [prices]);

  useEffect(() => {
    const loadPrices = async () => {
      const data = await fetchElectricityPrice();
      if (data && data.prices) {
        setPrices(data.prices.map((item) => item.value / 10));
      }
      setLoading(false);
    };
    loadPrices();
  }, []);

  const electricityTrend = (prices, period = 15) => {
    if (prices.length < period) return "Ei tarpeeksi dataa";
  
    const recentPrices = prices.slice(-period);
    const average = recentPrices.reduce((total, price) => total + price, 0) / period;
  
    const lastPrice = prices[prices.length - 1];
    return lastPrice > average ? "Nouseva" : "Laskeva";
  };

  const toggleHistory = async () => {
    setLoading(true);

    if (showHistory) {
      const data = await fetchElectricityPrice();
      if (data && data.prices) {
        setPrices(data.prices.map((item) => item.value / 10));
        setShowHistory(false);
      }
    } else {
      const data = await fetchElectricityPriceHistory(30);
      if (data && data.prices) {
        setPrices(data.prices.map((item) => item.value / 10));
        setShowHistory(true);
      }
    }

    setLoading(false);
  };

  const getCurrentPrice = () =>
    prices.length > 0 ? prices[new Date().getHours()].toFixed(2) : null;
  const getMinPrice = () =>
    prices.length > 0 ? Math.min(...prices).toFixed(2) : null;
  const getMaxPrice = () =>
    prices.length > 0 ? Math.max(...prices).toFixed(2) : null;

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={styles.container}>
      <Text>Nyt: {getCurrentPrice()} c/kWh</Text>
      <Text>
        {showHistory
          ? `30 päivän alin: ${getMinPrice()} c/kWh`
          : `Päivän alin: ${getMinPrice()} c/kWh`}
      </Text>
      <Text>
        {showHistory
          ? `30 päivän ylin: ${getMaxPrice()} c/kWh`
          : `Päivän ylin: ${getMaxPrice()} c/kWh`}
      </Text>
      <Text>Hinta trendi: {priceTrend}</Text>

      <LineChart
        data={{
          labels: showHistory
            ? dateLabels(30)
            : Array.from({ length: prices.length }, (_, i) => `${i}`),
          datasets: [{ data: prices }],
        }}
        width={350}
        height={220}
        bezier
        yAxisSuffix=" c"
        chartConfig={{
          decimalPlaces: 2,
          color: () => `rgb(255, 255, 255)`,
          labelColor: () => `rgb(255, 255, 255)`,
          propsForBackgroundLines: {
            stroke: "transparent",
          },
          propsForDots: { r: 0 },
        }}
        style={styles.chart}
      />
      <Button
        title={showHistory ? "Näytä päivän hinnat" : "Näytä hintahistoria"}
        onPress={toggleHistory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default MainScreen;
