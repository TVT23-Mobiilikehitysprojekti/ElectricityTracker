import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { fetchElectricityPrice, fetchElectricityPriceHistory } from "../utils/fetchElectricityPrice";

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
      <Text style={styles.header}>Sähkön Hinnat</Text>

      <View style={styles.priceCard}>
        <Text style={styles.currentPrice}>Nyt: {getCurrentPrice()} c/kWh</Text>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailText}>
          {showHistory
            ? `30 päivän alin: ${getMinPrice()} c/kWh`
            : `Päivän alin: ${getMinPrice()} c/kWh`}
        </Text>
        <Text style={styles.detailText}>
          {showHistory
            ? `30 päivän ylin: ${getMaxPrice()} c/kWh`
            : `Päivän ylin: ${getMaxPrice()} c/kWh`}
        </Text>
        <Text style={styles.detailText}>Hinta trendi: {priceTrend}</Text>
      </View>

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

      <TouchableOpacity style={styles.button} onPress={toggleHistory}>
        <Text style={styles.buttonText}>
          {showHistory ? "Näytä päivän hinnat" : "Näytä hintahistoria"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f8",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  priceCard: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  detailCard: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
    textAlign: "center",
  },
  chart: {
    marginVertical: 20,
    borderRadius: 16,
    elevation: 5,
  },
  button: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default MainScreen;
