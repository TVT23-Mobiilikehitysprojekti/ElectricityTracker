import React, { useReducer, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from 'react-native-uuid';
import { Button, FlatList, TextInput, View } from "react-native";
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
                kWhY: action.kWhY
            }
            return [...state,newPowerConsumer]
        case "UPDATE":
            let index = state.indexOf(action.id)
            const updatedPowerConsumer = {
                id: action.id,
                name: action.name,
                kWhY: action.kWhY
            }
            state[index] = updatedPowerConsumer
            return [state]
        default:
            return state
    }
}

export default function ElectricityCalculatorScreen() {
    const [PowerConsumers, dispatch] = useReducer(reducer,memory)
    const [data, setData] = useState([])
    const [memory, setMemory] = useState([])
    const [name, setName] = useState('')
    const [kWhY, setKWhy] = useState('')
    const [visible, setVisible] = useState(false)

    const toggleOverlay = () => {
        setVisible(!visible);
    };
    
    const handleRemove = (id) => {
        dispatch({type: "REMOVE", id})
    }
    const handleAdd = (data) => {
        dispatch({type: "ADD", data})
        setData([])
    }
    const handleUpdate = (id, data) => {
        dispatch({type: "UPDATE", id, data})
        setData([])
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
                
            </View>
            <Button onPress={toggleOverlay}>New item</Button>
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
                <Button onPress={() => handleAdd([name,kWhY])}>Add</Button>
            </Overlay>
            <FlatList
            
            />
        </View>
    )
}