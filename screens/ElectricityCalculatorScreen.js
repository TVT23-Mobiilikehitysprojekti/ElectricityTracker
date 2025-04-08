import React, { useReducer, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { Button, FlatList, TextInput, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Overlay } from '@rneui/themed';
import PowerConsumerComp from "../components/PowerConsumerComp";

const STORAGE_KEY = '@items_key';
const USER_ID = '@user_key';

function getByteSize(arr) {
    let bytes = 0;

    arr.forEach(item => {
        if (typeof item === 'string') {
            bytes += item.length * 2; // Each character in a string is roughly 2 bytes
        } else if (typeof item === 'number') {
            bytes += 8; // Numbers typically take 8 bytes
        } else if (typeof item === 'boolean') {
            bytes += 4; // Booleans usually take around 4 bytes
        } else if (item instanceof Object) {
            bytes += JSON.stringify(item).length * 2; // Approximate object size by stringifying
        }
    });

    return bytes;
}
const reducer = (state, action) => {
    switch (action.type) {
        case "REMOVE":
            return state.filter((PowerConsumer) => PowerConsumer.id !== action.id);
        case "ADD":
            const newPowerConsumer = {
                id: uuid.v4(),
                name: action.name,
                kWhY: parseFloat(action.kWhY),
                calcs: []
            };
            return [...state, newPowerConsumer];
        case "UPDATE":
            return state.map((item) =>
                item.id === action.id ? { ...item, name: action.name, kWhY: parseFloat(action.kWhY) } : item
            );
        case "CALCULATE":
            return state.map((element) => ({
                ...element,
                calcs: [
                    (element.kWhY / 365) * action.price,
                    (element.kWhY / 52) * action.price,
                    (element.kWhY / 12) * action.price,
                    element.kWhY * action.price
                ]
            }));
        case "LOAD":
            return state = action.data
        default:
            return state;
    }
};

export default function ElectricityCalculatorScreen() {
    const [PowerConsumers, dispatch] = useReducer(reducer, []);
    const [prices, setPrices] = useState([0, 0, 0, 0]);
    const [name, setName] = useState('');
    const [kWhY, setKWhY] = useState('');
    const [visible, setVisible] = useState(false);

    const toggleOverlay = () => {
        setVisible(!visible);
    };

    const handleAdd = () => {
        dispatch({ type: "ADD", name, kWhY });
        toggleOverlay();
        setName('');
        setKWhY('');
    };

    const handleCalculate = (price) => {
        dispatch({ type: "CALCULATE", price: parseFloat(price) })
    };

    const calculateTotals = () => {
        const totals = [0, 0, 0, 0];
        PowerConsumers.forEach((element) => {
            totals[0] += element.calcs[0] || 0;
            totals[1] += element.calcs[1] || 0;
            totals[2] += element.calcs[2] || 0;
            totals[3] += element.calcs[3] || 0;
        });
        setPrices(totals);
    };

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem(STORAGE_KEY);
            const json = value ? JSON.parse(value) : [];
            dispatch({ type: "LOAD", data: json });
        } catch (ex) {
            console.log("error getting data: ", ex);
        }
    };

    const storeData = async (value) => {
        try {
            const json = JSON.stringify(value);
            await AsyncStorage.setItem(STORAGE_KEY, json);
        } catch (ex) {
            console.log("error storing data: ", ex);
        }
    };


    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        storeData(PowerConsumers);
        calculateTotals()
    }, [PowerConsumers]);

    return (
        <View style={styles.container}>
            <View style={styles.priceSection}>
                <Text style={styles.title}>Price of Electricity</Text>
                <TextInput
                    keyboardType="numeric"
                    style={styles.input}
                    onChangeText={(newPrice) => handleCalculate(newPrice)}
                    placeholder="Enter price per kWh"
                />
                <View style={styles.priceDetails}>
                    <Text style={styles.priceText}>Daily: {prices[0].toFixed(2)} €</Text>
                    <Text style={styles.priceText}>Weekly: {prices[1].toFixed(2)} €</Text>
                    <Text style={styles.priceText}>Monthly: {prices[2].toFixed(2)} €</Text>
                    <Text style={styles.priceText}>Yearly: {prices[3].toFixed(2)} €</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.overlayButton} onPress={toggleOverlay}>
                <Text style={styles.overlayButtonText}>New Item</Text>
            </TouchableOpacity>

            <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
                <View style={styles.overlayContent}>
                    <Text style={styles.overlayTitle}>Enter Data!</Text>
                    <TextInput
                    placeholder="Enter name"
                    style={styles.input}
                    value={name}
                    onChangeText={(newName) => setName(newName)}
                    />
                    <TextInput
                    placeholder="Enter yearly kWh"
                    keyboardType="numeric"
                    style={styles.input}
                    value={kWhY}
                    onChangeText={(newKWhY) => setKWhY(newKWhY)}
                    />
                    <Button title="Add" onPress={handleAdd} />
                </View>
            </Overlay>

            <FlatList
                data={PowerConsumers}
                style={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.consumerBox}>
                        <PowerConsumerComp
                            item={item}
                            update={(updatedItem) => {
                            dispatch({ type: "UPDATE", ...updatedItem });
                            }}
                            remove={() => {
                            dispatch({ type: "REMOVE", id: item.id });
                            }}
                        />
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                />
            </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#f4f4f8", 
    },
    priceSection: {
      marginBottom: 20,
      backgroundColor: "#ffffff", 
      padding: 15,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2, 
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#333",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      backgroundColor: "#ffffff",
    },
    priceDetails: {
      marginTop: 10,
    },
    priceText: {
      fontSize: 16,
      marginVertical: 5,
      color: "#555",
    },
    overlayButton: {
      backgroundColor: "#007AFF", 
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
      marginBottom: 15,
    },
    overlayButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "bold",
    },
    overlayContent: {
      padding: 20,
      alignItems: "center",
    },
    overlayTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#333",
    },
    list: {
      marginTop: 10,
    },
    consumerBox: {
      backgroundColor: "#ffffff",
      marginVertical: 5,
      padding: 10,
      borderRadius: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 1,
    }, 
  });