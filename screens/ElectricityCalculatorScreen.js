import React, { useReducer, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { Button, FlatList, TextInput, View, Text } from "react-native";
import { Overlay } from '@rneui/themed';

const STORAGE_KEY = '@items_key';

const reducer = (state, action) => {
    switch(action.type) {
        case "REMOVE":
            return state.filter((PowerConsumer) => PowerConsumer.id !== action.id)
        case "ADD":
            const newPowerConsumer = {
                id: uuid.v4(),
                name: action.name,
                kWhY: action.kWhY,
                calcs: []
            }
            return [...state,newPowerConsumer]
        case "UPDATE":
            let index = state.indexOf(action.id)
            const updatedPowerConsumer = {
                id: action.id,
                name: action.name,
                kWhY: action.kWhY,
                calcs: []
            }
            state[index] = updatedPowerConsumer
            return [state]
        case "CALCULATE":
            state.forEach(element => {
                element.calcs = [
                    (kWhY/365)*action.price,
                    (kWhY/52)*action.price,
                    (kWhY/12)*action.price,
                    kWhY*action.price

                ]
            })
            return[state]
        default:
            return state
    }
}

export default function ElectricityCalculatorScreen() {
    const [PowerConsumers, dispatch] = useReducer(reducer,memory)
    const [data, setData] = useState([])
    const [memory, setMemory] = useState([])
    const [prices, setPrices] = useState([])
    const [name, setName] = useState('')
    const [kWhY, setKWhy] = useState('')
    const [visible, setVisible] = useState(false)

    const toggleOverlay = () => {
        setVisible(!visible);
    }
    
    const handleRemove = (id) => {
        dispatch({type: "REMOVE", id})
    }
    const handleAdd = () => {
        setData([name,kWhY])
        dispatch({type: "ADD", data})
        setData([])
    }
    const handleUpdate = (id, data) => {
        dispatch({type: "UPDATE", id, data})
        setData([])
    }
    const handleCalculate = (price) => {
        dispatch({type: "CALCULATE", price})
        calculateTotals()
    }

    const calculateTotals = () => {
        let totals = [0,0,0,0]
        PowerConsumers.forEach(element => {
            totals[0] += element.calcs[0],
            totals[1] += element.calcs[1],
            totals[2] += element.calcs[2],
            totals[3] += element.calcs[3]
        });
        setPrices(totals)
    }

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem(STORAGE_KEY);
            const json = JSON.parse(value);
            if (json === null) {
                json = [];
            }
            setMemory(json);
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
    }, [PowerConsumers]);

    return (
        <View>
            <View>
                <Text>Price of electricity</Text>
                <TextInput onChangeText={newPrice => handleCalculate(newPrice)}
                    placeholder="0"></TextInput>
                <Text>Daily: {prices[0]}</Text>
                <Text>Weekly: {prices[1]}</Text>
                <Text>Monthly: {prices[2]}</Text>
                <Text>Yearly: {prices[3]}</Text>
            </View>
            <Button title="New item" onPress={toggleOverlay}></Button>
            <Overlay 
            isVisible={visible} 
            onBackdropPress={toggleOverlay}>
                <Text>Type data!</Text>
                <TextInput 
                placeholder="Enter name"
                onChangeText={newName => setName(newName)}></TextInput>
                <TextInput 
                placeholder="Enter kWh yearly"
                onChangeText={newKWhy => setKWhy(newKWhy)}></TextInput>
                <Button title="Add" onPress={() => handleAdd([name,kWhY])}></Button>
            </Overlay>
            <FlatList
            data={PowerConsumers}
            renderItem={({item}) => PowerConsumerComp(item, handleUpdate)}
            keyExtractor={item => item.id}
            />
        </View>
    )
}