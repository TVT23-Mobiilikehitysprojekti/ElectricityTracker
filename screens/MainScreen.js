import React, { useEffect, useState } from "react";
import {View, Text, StyleSheet, Button } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { fetchElectricityPrice, fetchElectricityPriceHistory } from "../utils/fetchElectricityPrice";

const MainScreen = () => {
  const [currentData, setCurrentData] = useState({ EE: [], FI: [] });
  const [historyData, setHistoryData] = useState({ EE: [], FI: [] });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("finland");
  const [showHistory, setShowHistory] = useState(false);
  const [priceTrend, setPriceTrend] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [current, history] = await Promise.all([
          fetchElectricityPrice(),
          fetchElectricityPriceHistory(30),
        ]);
        setCurrentData(current);
        setHistoryData(history);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  
  useEffect(() => {
    const prices = currentView === "finland" ? currentData.FI : currentData.EE;
    const trend = electricityTrend (prices, 15);
    setPriceTrend(trend);
  }, [currentData, currentView]);

  const electricityTrend = (prices, period = 15) => {
    const recentPrices = prices.slice(-period);
    const average = recentPrices.reduce((total, price) => total + price, 0) / period;
    const lastPrice = prices[prices.length - 1];
    return lastPrice > average ? "Nouseva" : "Laskeva";
  };

  const getDisplayData = () => {
    const country = currentView === "finland" ? "FI" : "EE";
    return showHistory ? historyData[country] : currentData[country];
  };

  const getChartData = () => {
    const data = getDisplayData();

    if (showHistory) {
      const dailyAverages = {};
      data.forEach((item) => {
        const date = item.date.split("T")[0];
        if (!dailyAverages[date]) {
          dailyAverages[date] = {
            sum: 0,
            count: 0,
            date: new Date(date),
          };
        }
        dailyAverages[date].sum += item.price;
        dailyAverages[date].count++;
      });

      const sortedDates = Object.keys(dailyAverages)
        .map((date) => dailyAverages[date])
        .sort((a, b) => a.date - b.date);

      const labels = [];
      const values = [];
      sortedDates.forEach((day, index) => {
        values.push((day.sum / day.count).toFixed(2));
        if (index % 5 === 0 || index === sortedDates.length - 1) {
          labels.push(
            day.date.toLocaleDateString("fi-FI", {
              day: "numeric",
              month: "numeric",
            })
          );
        } else {
          labels.push("");
        }
      });

      return {
        labels,
        datasets: [
          {
            data: values,
            strokeWidth: 2,
          },
        ],
      };
    } else {
      const hours = Array.from({ length: 24 }, (_, i) => `${i}`);
      return {
        labels: hours,
        datasets: [
          {
            data: data,
            strokeWidth: 2,
          },
        ],
      };
    }
  };

  const getCurrentPrice = () => {
    const currentHour = new Date().getHours();
    const prices = currentView === "finland" ? currentData.FI : currentData.EE;
    return prices[currentHour].toFixed(2);
  };

  const getMinPrice = () => {
    const data = getDisplayData();
    const prices = showHistory ? data.map((item) => item.price) : data;
    return Math.min(...prices).toFixed(2);
  };

  const getMaxPrice = () => {
    const data = getDisplayData();
    const prices = showHistory ? data.map((item) => item.price) : data;
    return Math.max(...prices).toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Ladataan pörssisähkön hintatietoja...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.selector}>
        <Button
          title="Suomi"
          onPress={() => setCurrentView("finland")}
          color={currentView === "finland" ? "#007AFF" : "#CCCCCC"}
        />
        <Button
          title="Viro"
          onPress={() => setCurrentView("estonia")}
          color={currentView === "estonia" ? "#007AFF" : "#CCCCCC"}
        />
      </View>

      <Text>Nyt: {getCurrentPrice()} c/kWh</Text>
      <Text>
        {showHistory ? "30 päivän alin" : "Päivän alin"}: {getMinPrice()} c/kWh
      </Text>
      <Text>
        {showHistory ? "30 päivän ylin" : "Päivän ylin"}: {getMaxPrice()} c/kWh
      </Text>
      <Text>Trendi: {priceTrend}
      </Text>

      <LineChart
        data={getChartData()}
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
        title={showHistory ? "Näytä päivän hinnat" : "Näytä 30 päivän historia"}
        onPress={() => setShowHistory(!showHistory)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default MainScreen;
