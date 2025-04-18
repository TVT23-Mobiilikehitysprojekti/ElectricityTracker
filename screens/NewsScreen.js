import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet } from "react-native";
import OpenURLButton from "../components/OpenURLButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import RSSParser from 'react-native-rss-parser';
import LoadingComponent from "../components/LoadingEffect";
import { AppContext } from "../App";

const USER_ID = '@user_key';
const rssFeeds = [
    "https://feeds.yle.fi/uutiset/v1/majorHeadlines/YLE_UUTISET.rss",
    "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET",
    "https://feeds.yle.fi/uutiset/v1/mostRead/YLE_UUTISET.rss"
];

export default function NewsScreen() {
  const { serverResponse } = useContext(AppContext);
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState("");

  const getNews = async () => {
    if (!serverResponse) {
      console.log("Server is not ready. Skipping news fetch.");
      return;
    }

    setLoading(true);
    let allItems = [];

    try {
      for (const feed of rssFeeds) {
        const response = await fetch(feed);
        const text = await response.text();
        const rss = await RSSParser.parse(text);
        allItems = [...allItems, ...rss.items];
      }

      const filteredItems = filterByCategory(allItems, ["Energia", "Sähkön hinta", "politiikka"]);
      setData(filteredItems);
    } catch (error) {
      console.error("Error fetching news:", error);
    }

    setLoading(false);
  };

  const filterByCategory = (items, categories) => {
    return items.filter(item => item.categories?.some(cat => categories.includes(cat.name)));
  };

  const checkUserId = async () => {
    try {
      const value = await AsyncStorage.getItem(USER_ID);
      const json = value ? JSON.parse(value) : null;
      if (!json) {
        const id = uuid.v4();
        await AsyncStorage.setItem(USER_ID, JSON.stringify(id));
        setUserId(id);
      } else {
        setUserId(json);
      }
    } catch (ex) {
      console.log("Error getting user ID:", ex);
    }
  };

  useEffect(() => {
    checkUserId();
    if (serverResponse) {
      console.log("Server is ready. Fetching data... (NewsScreen)");
      getNews();
    }

    const interval = setInterval(() => {
      if (serverResponse) {
        console.log("Server is ready. Fetching data... (NewsScreen)");
        getNews();
      } else {
        console.log("Server is not ready. Skipping request. (NewsScreen)");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [serverResponse]);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <LoadingComponent loading={isLoading} />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}
          data={data}
          renderItem={({ item }) => (
            <OpenURLButton style={styles.urlbutton} url={item.id} userId={userId}>
              {item.title} {item.published}
            </OpenURLButton>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //marginTop: StatusBar.currentHeight || 0,
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
