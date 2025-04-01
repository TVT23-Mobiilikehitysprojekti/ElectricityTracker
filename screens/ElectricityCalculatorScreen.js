import React, { useReducer, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { Button, FlatList, TextInput, View, Text } from "react-native";
import { Overlay } from '@rneui/themed';
import PowerConsumerComp from "../components/PowerConsumerComp";

const STORAGE_KEY = '@items_key';

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

    const handleRemove = (id) => {
        dispatch({ type: "REMOVE", id });
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
        <View>
            <View>
                <Text>Price of electricity</Text>
                <TextInput
                    keyboardType="numeric"
                    onChangeText={(newPrice) => handleCalculate(newPrice)}
                    placeholder="Enter price per kWh"
                />
                <Text>Daily: {prices[0].toFixed(2)}</Text>
                <Text>Weekly: {prices[1].toFixed(2)}</Text>
                <Text>Monthly: {prices[2].toFixed(2)}</Text>
                <Text>Yearly: {prices[3].toFixed(2)}</Text>
            </View>
            <Button title="New item" onPress={toggleOverlay} />
            <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
                <Text>Enter data!</Text>
                <TextInput
                    placeholder="Enter name"
                    value={name}
                    onChangeText={(newName) => setName(newName)}
                />
                <TextInput
                    placeholder="Enter kWh yearly"
                    keyboardType="numeric"
                    value={kWhY}
                    onChangeText={(newKWhY) => setKWhY(newKWhY)}
                />
                <Button title="Add" onPress={handleAdd} />
            </Overlay>
            <FlatList
                data={PowerConsumers}
                renderItem={({ item }) => (
                    <PowerConsumerComp
                        item={item}
                        update={(updatedItem) => {
                            dispatch({ type: "UPDATE", ...updatedItem });
                        }}
                        remove={() => {
                            dispatch({ type: "REMOVE", id: item.id})
                        }}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}
