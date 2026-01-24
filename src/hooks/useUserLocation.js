import { useState } from 'react';
import * as Location from 'expo-location';

export const useUserLocation = (initialLocation = null) => {
    const [location, setLocation] = useState(initialLocation);
    const [address, setAddress] = useState('Tap "Locate" to get your address');
    const [errorMsg, setErrorMsg] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    const getUserLocation = async (onLocationFound, showAlert) => {
        setIsLocating(true);
        setErrorMsg(null);

        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Location permission denied');
                if (showAlert) showAlert('Permission Required', 'Location access is needed to show your address.', [{ text: 'OK' }], 'location-outline');
                return null;
            }

            let userLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setLocation(userLocation);

            const [result] = await Location.reverseGeocodeAsync({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
            });

            if (result) {
                const readableAddress = `${result.street || result.name || ''}, ${result.city || ''}, ${result.country || ''}`;
                setAddress(readableAddress);
                const locationData = {
                    coords: userLocation.coords,
                    address: readableAddress
                };
                if (onLocationFound) onLocationFound(locationData);
            }
        } catch (error) {
            setErrorMsg('Error getting location');
            if (showAlert) showAlert('Location Error', 'Could not retrieve your location. Please try again.', [{ text: 'OK' }], 'alert-circle-outline');
        } finally {
            setIsLocating(false);
        }
    };

    return {
        location,
        address,
        isLocating,
        errorMsg,
        getUserLocation,
        setLocation,
        setAddress
    };
};
