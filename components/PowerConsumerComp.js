import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
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
        <View style={styles.consumerBox}>
            <Text style={styles.title}>Name: {item.name}</Text>
            <Text style={styles.priceText}>kWh/year: {item.kWhY}</Text>
            <Text style={styles.priceText}>Daily: {item.calcs[0]?.toFixed(2)} €</Text>
            <Text style={styles.priceText}>Weekly: {item.calcs[1]?.toFixed(2)} €</Text>
            <Text style={styles.priceText}>Monthly: {item.calcs[2]?.toFixed(2)} €</Text>
            <Text style={styles.priceText}>Yearly: {item.calcs[3]?.toFixed(2)} €</Text>
    
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                <TouchableOpacity style={styles.overlayButton} onPress={toggleOverlay}>
                    <Text style={styles.overlayButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.overlayButton} onPress={handleDelete}>
                    <Text style={styles.overlayButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
    
            <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
                <View style={styles.overlayContent}>
                    <Text style={styles.overlayTitle}>Edit Item</Text>
                    <TextInput
                        placeholder="Name"
                        style={styles.input}
                        value={editedName}
                        onChangeText={(text) => setEditedName(text)}
                    />
                    <TextInput
                        placeholder="kWh/year"
                        keyboardType="numeric"
                        style={styles.input}
                        value={editedKWhY.toString()}
                        onChangeText={(text) => setEditedKWhY(text)}
                    />
                    <TouchableOpacity style={styles.overlayButton} onPress={handleSave}>
                        <Text style={styles.overlayButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </Overlay>
        </View>
    );    
}

const styles = StyleSheet.create({
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
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    priceText: {
        fontSize: 16,
        marginVertical: 5,
        color: "#555",
    },
    overlayButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
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
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: "#ffffff",
        width: "100%",
    },
})