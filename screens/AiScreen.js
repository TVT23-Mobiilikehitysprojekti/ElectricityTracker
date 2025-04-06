import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import axios from "axios";

export default function AiScreen() {
  const [summary, setSummary] = useState("");
  const [summaryDate, setSummaryDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLatestSummary = async () => {
    setLoading(true);
    setSummary("");
    setSummaryDate("");

    try {
      console.log("Fetching latest summary from the backend...");
      const response = await axios.get("https://electricitytracker-backend.onrender.com/huggingface/latest-summary");

      console.log("API Response:", response.data);

      if (response.data && response.data.summary && response.data.timestamp) {
        const timestamp = new Date(response.data.timestamp);
        const formattedDate = timestamp.toLocaleDateString("fi-FI");

        setSummaryDate(formattedDate);
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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {summaryDate ? `Summary for ${summaryDate}` : "Summary"}
      </Text>
      <TouchableOpacity style={styles.fetchButton} onPress={fetchLatestSummary} disabled={loading}>
      <Text style={styles.fetchButtonText}>
        {loading ? "Fetching..." : "Fetch Latest Summary"}
      </Text>
    </TouchableOpacity>
      
      <ScrollView style={styles.outputContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.label}>Summary:</Text>
          <Text style={styles.output}>{loading ? "Loading..." : summary}</Text>
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
  fetchButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  fetchButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
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
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
    color: "#495057",
  },
  output: {
    fontSize: 16,
    color: "#212529", 
    marginTop: 5,
  },
});
