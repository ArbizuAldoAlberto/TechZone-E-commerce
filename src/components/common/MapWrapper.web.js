import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const MapView = (props) => {
    return (
        <View style={[styles.container, props.style]}>
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2000&auto=format&fit=crop' }}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
            />
            <View style={styles.overlay}>
                <Text style={styles.text}>Interactive Map not available on Web</Text>
            </View>
            {props.children}
        </View>
    );
};

export const Marker = () => null;
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    }
});

export default MapView;
