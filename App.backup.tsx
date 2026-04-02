import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
    console.log('Minimal App.tsx executing');

    return (
        <View style={styles.container}>
            <Text style={styles.text}>🦜 Hello from Parrot Master!</Text>
            <Text style={styles.subtext}>Minimal test app - if you see this, Expo web works!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtext: {
        fontSize: 16,
        color: '#666',
    },
});
