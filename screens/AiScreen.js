import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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

  useEffect(() => {
    fetchLatestSummary();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {summaryDate ? `Summary for ${summaryDate}` : "Summary"}
      </Text>
      
      <ScrollView style={styles.outputContainer}>
        <Text style={styles.label}>Summary:</Text>
        <Text style={styles.output}>{loading ? "Loading..." : summary}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  outputContainer: { marginTop: 10 },
  label: { fontWeight: "bold", marginTop: 10 },
  output: { marginTop: 5, fontSize: 16 },
});
