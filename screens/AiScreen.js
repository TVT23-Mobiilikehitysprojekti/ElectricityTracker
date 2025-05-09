import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import LoadingComponent from "../components/LoadingEffect";
import { AppContext } from "../App";

export default function AiScreen() {
  const { serverResponse } = useContext(AppContext);
  const [summary, setSummary] = useState("");
  const [summaryDate, setSummaryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState("");

  const daysOfWeek = ["Sunnuntain", "Maanantain", "Tiistain", "Keskiviikon", "Torstain", "Perjantain", "Lauantain"];

  const fetchLatestSummary = async () => {
    if (!serverResponse) {
      return;
    }

    setLoading(true);
    setSummary("");
    setSummaryDate("");

    try {
      const response = await axios.get("https://electricitytracker-backend.onrender.com/huggingface/latest-summary");

      if (response.data && response.data.summary && response.data.timestamp) {
        const timestamp = new Date(response.data.timestamp);
        const formattedDate = timestamp.toLocaleDateString("fi-FI");

        setSummaryDate(formattedDate);

        const calculatedDayOfWeek = daysOfWeek[timestamp.getDay()];
        setDayOfWeek(calculatedDayOfWeek);

        setSummary(response.data.summary);
      } else {
        setSummary("No summary available.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setSummary("Error fetching the summary.");
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchData = () => {
      if (serverResponse) {
        console.log("Server is ready. Fetching data... (AiScreen)");
        fetchLatestSummary();
        if (interval) {
          clearInterval(interval);
        }
      } else {
        console.log("Server is not ready. Skipping requests. (AiScreen)");
      }
    };

    fetchData();
    const interval = setInterval(() => {
      if (!serverResponse) {
        console.log("Server is not ready. Retrying fetch... (AiScreen)");
        fetchData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [serverResponse]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {summaryDate ? `${dayOfWeek} tilannekatsaus (${summaryDate})` : "Summary"}
      </Text>

      <ScrollView style={styles.outputContainer}>
        <View style={styles.summaryBox}>
          {loading ? (
            <LoadingComponent loading={loading} />
          ) : (
            <Text style={styles.output}>{summary}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  outputContainer: {
    marginTop: 15,
  },
  summaryBox: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  output: {
    fontSize: 16,
    color: "#212529",
    marginTop: 5,
  },
});
