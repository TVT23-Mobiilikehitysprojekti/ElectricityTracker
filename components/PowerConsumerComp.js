import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { Overlay } from "@rneui/themed";

export default function PowerConsumerComp({ item, update, remove }) {
    const [visible, setVisible] = useState(false);
    const [editedName, setEditedName] = useState(item.name);
    const [editedKWhY, setEditedKWhY] = useState(item.kWhY);

    const toggleOverlay = () => {
        setVisible(!visible);
    };

    const handleSave = () => {
        const updatedItem = {
            ...item,
            name: editedName,
            kWhY: parseFloat(editedKWhY)
        };
        update(updatedItem);
        toggleOverlay();
    };

    const handleDelete = () => {
        remove()
    }

    return (
        <View>
            <Text>Name: {item.name}</Text>
            <Text>kWh/year: {item.kWhY}</Text>
            <Text>Daily: {item.calcs[0]?.toFixed(2)}</Text>
            <Text>Weekly: {item.calcs[1]?.toFixed(2)}</Text>
            <Text>Monthly: {item.calcs[2]?.toFixed(2)}</Text>
            <Text>Yearly: {item.calcs[3]?.toFixed(2)}</Text>

            <Button title="Edit" onPress={toggleOverlay} />
            <Button title="Delete" onPress={handleDelete} />

            <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
                <View>
                    <Text>Edit Item</Text>
                    <TextInput
                        placeholder="Name"
                        value={editedName}
                        onChangeText={(text) => setEditedName(text)}
                    />
                    <TextInput
                        placeholder="kWh/year"
                        keyboardType="numeric"
                        value={editedKWhY.toString()}
                        onChangeText={(text) => setEditedKWhY(text)}
                    />
                    <Button title="Save" onPress={handleSave} />
                </View>
            </Overlay>
        </View>
    );
}