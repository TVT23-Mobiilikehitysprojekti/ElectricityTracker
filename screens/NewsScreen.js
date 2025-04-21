import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet, StatusBar } from "react-native";
import OpenURLButton from "../components/OpenURLButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import RSSParser from 'react-native-rss-parser';
import LoadingComponent from "../components/LoadingEffect";

const USER_ID = '@user_key';
const rssFeeds = [
    "https://feeds.yle.fi/uutiset/v1/recent.rss?publisherIds=YLE_UUTISET"
];

export default function NewsScreen() {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [userId, setUserId] = useState('');

  const getNews = async () => {
    try {
      console.log("Fetching news");
      let allItems = [];
      for (const feed of rssFeeds) {
        const response = await fetch(feed);
        const text = await response.text();
        const rss = await RSSParser.parse(text);
        allItems = [...allItems, ...rss.items];
      }
      
      const filteredItems = filterByCategory(allItems, [
        "sää",
        "sääennusteet",
        "sähkösopimus",
        "sähkökatkot",
        "sähkölämmitys",
        "sähkölasku",
        "sähkön hinta",
        "sähkömarkkinat",
        "energia",
        "sähköntuotanto ja -jakelu",
        "energia-ala",
        "olkiluodon ydinvoimalaitos",
        "loviisan ydinvoimalaitos",
        "lämpöhuolto",
        "kaukolämpö",
        "polttoaineet",
        "biopolttoaineet",
        "maakaasu",
        "kivihiili",
        "uusiutuvat energialähteet",
        "tuulienergia",
        "vesivoima",
        "aurinkoenergia",
        "aurinkovoimalat",
        "aurinkopaneelit",
        "maalämpö",
        "bioenergia",
        "fingrid",
      ]);

      setData(filteredItems);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterByCategory = (items, categories) => {
    return items.filter(item => {
      if (item.categories && Array.isArray(item.categories)) {
        return item.categories.some(cat => {
          return categories.includes(cat.name);
        });
      }
      return false;
    });
  };  
  
  const checkUserId = async () => {
    try {
      const value = await AsyncStorage.getItem(USER_ID);
      let json = null;
      if (value) {
        try {
          json = JSON.parse(value);
        } catch (parseError) {
          console.log("error parsing user_id: ", parseError);
        }
      }
      if (json === null) {
        const id = uuid.v4();
        await AsyncStorage.setItem(USER_ID, JSON.stringify(id));
        setUserId(id);
      } else {
        setUserId(json);
      }
    } catch (ex) {
      console.log("error getting user_id: ", ex);
    }
  };

  useEffect(() => {
    checkUserId();
    getNews();
    const interval = setInterval(() => {
      getNews();
    }, 60000); // Fetch news every 60 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <LoadingComponent loading={isLoading} />
      ) : (
        <FlatList
        contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}
          data={data}
          renderItem={({ item }) => (
            <OpenURLButton
              style={styles.urlbutton}
              url={item.id}
              userId={userId}
            >
              {item.title}
              {item.published}
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