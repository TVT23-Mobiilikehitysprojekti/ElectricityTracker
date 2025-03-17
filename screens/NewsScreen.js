import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, View, StyleSheet, StatusBar } from "react-native";
import OpenURLButton from "../components/OpenURLButton";
export default function NewsScreen(){
    const DATA = [
        {
          id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
          title: 'First Item',
        },
        {
          id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
          title: 'Second Item',
        },
        {
          id: '58694a0f-3da1-471f-bd96-145571e29d72',
          title: 'Third Item',
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
    }
});