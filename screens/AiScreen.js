import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";
import { HfInference } from "@huggingface/inference";
import { HUGGINGFACE_API_KEY } from "@env"; 

console.log(HUGGINGFACE_API_KEY);

// Huggimgface api/token https://huggingface.co/docs/hub/en/security-tokens
const inference = new HfInference(HUGGINGFACE_API_KEY);

export default function AiScreen() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  
  const currentDate = new Date().toLocaleDateString("fi-FI");

  const summarizeText = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text!");
      return;
    }

    setLoading(true);
    setSummary("");

    try {
      console.log("Sending request to Hugging Face API...");
      const response = await inference.textGeneration({
        model: "Finnish-NLP/Ahma-3B-Instruct",
        inputs: `Tiivistä seuraava teksti: ${inputText}`,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.5,
          repetition_penalty: 1.2,
        },
      });

      console.log("API Response:", response);
      setSummary(response.generated_text || "No summary available.");
    } catch (error) {
      console.error("API Error:", error);
      setSummary("Error processing text.");
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Summary of {currentDate}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter text to summarize..."
        value={inputText}
        onChangeText={setInputText}
        multiline
      />
      <Button title="Summarize" onPress={summarizeText} disabled={loading} />
      
      <ScrollView style={styles.outputContainer}>
        <Text style={styles.label}>Summary:</Text>
        <Text style={styles.output}>{loading ? "Loading..." : summary}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  heading: { fontSize: 20, fontWeight: "bold", marginBottom: 10,textAlign: "center"},
  input: { borderWidth: 1, padding: 10, marginBottom: 10, height: 100 },
  outputContainer: { marginTop: 10 },
  label: { fontWeight: "bold", marginTop: 10 },
  output: { marginTop: 5, fontSize: 16 },
});
