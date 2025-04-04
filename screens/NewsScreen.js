
import React, {useEffect, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet, StatusBar } from "react-native";
import OpenURLButton from "../components/OpenURLButton";
import axios from 'axios';

export default function NewsScreen() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const getNews = async () => {
    try {
        console.log("Fetching news");
        const response = await axios.get("https://electricitytracker-backend.onrender.com/api/news");
        setData(response.data.results);
        console.log("Data set successfully.");
    } catch (error) {
        console.error("Error fetching news:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      getNews();
  }, []);

  return (
      <SafeAreaView style={styles.container}>
          <FlatList
              data={data}
              renderItem={({ item }) => (
                  <OpenURLButton
                      styling={styles.urlbutton}
                      url={item.link}
                  >
                      {item.title}
                      {item.source_id}
                  </OpenURLButton>
              )}
              keyExtractor={(item) => item.article_id}
          />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    urlbutton: {
        fontSize: 54,
        backgroundColor: '#f9c2ff',
        padding: 60,
        marginVertical: 15,
        marginHorizontal: 16
    },
    text: {
        fontSize: 200,
    }
});

