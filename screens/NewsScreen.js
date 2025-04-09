
import React, {useEffect, useState} from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet, StatusBar } from "react-native";
import OpenURLButton from "../components/OpenURLButton";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';

const USER_ID = '@user_key';

export default function NewsScreen() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState('');

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

    const checkUserId = async () => {
        try {
            const value = await AsyncStorage.getItem(USER_ID);
            const json = value ? JSON.parse(value) : null;
            if (json === null) {
                id = uuid.v4()
                await AsyncStorage.setItem(USER_ID, id);
                setUserId(id);
            } else {
                setUserId(json)
            }
        } catch (ex) {
            console.log("error getting user_id: ", ex);
        }
    };
  
  useEffect(() => {
      getNews();
      checkUserId();
  }, []);

  return (
      <SafeAreaView style={styles.container}>
          <FlatList
              data={data}
              renderItem={({ item }) => (
                  <OpenURLButton
                      styling={styles.urlbutton}
                      url={item.link}
                      userId={userId}
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

