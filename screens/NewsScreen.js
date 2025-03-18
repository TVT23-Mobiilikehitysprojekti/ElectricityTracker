import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet, StatusBar } from "react-native";
import OpenURLButton from "../components/OpenURLButton";
export default function NewsScreen(){
    const DATA = [
        {
          id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
          text: '1st text',
          title: 'First Item',
        },
        {
          id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
          text: '2st text',
          title: 'Second Item',
        },
        {
          id: '58694a0f-3da1-471f-bd96-145571e29d72',
          text: '3st text',
          title: 'Third Item',
        },
        {
            id: '1df3c762-8baf-4321-8349-5f6e4526d931',
            text: '4th text',
            title: 'Fourth Item',
            },
            {
            id: 'e41f6bb2-526d-4cf6-89dc-2f4d3b80a8c0',
            text: '5th text',
            title: 'Fifth Item',
            },
            {
            id: 'a7d5bb3c-213c-4329-9eaf-cd96b8766522',
            text: '6th text',
            title: 'Sixth Item',
            },
            {
            id: 'f68d2e5b-1f83-4b64-9456-5f1b25f2a0b1',
            text: '7th text',
            title: 'Seventh Item',
            },
            {
            id: '95be1426-614b-4fb8-bbd6-b263a6722f55',
            text: '8th text',
            title: 'Eighth Item',
            },
      ];
      const supportedURL = 'https://google.com';
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={DATA}
                renderItem={ ({item}) => 
                <OpenURLButton
                    styling={styles.urlbutton}
                    url={supportedURL}
                >{item.title}
                {item.text}

                </OpenURLButton>}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    )
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