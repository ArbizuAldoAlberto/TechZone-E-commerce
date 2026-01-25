import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

/**
 * Hook personalizado para gestionar la geolocalización del usuario.
 * 
 * @description Encapsula la lógica de obtención de permisos, ubicación actual y geocodificación inversa.
 * Diseñado para ser agnóstico de la UI, exponiendo estado y métodos controlables.
 * 
 * @context Layer: Domain/Logic | Component: Hook
 * @requirements expo-location
 * 
 * @param {Object|null} initialLocation - Estado inicial opcional para la ubicación (hidratación).
 * @returns {Object} Interface pública del hook.
 */
export const useUserLocation = (initialLocation = null) => {
    // ESTADO INTERNO
    const [location, setLocation] = useState(initialLocation);
    const [address, setAddress] = useState('Tap "Locate" to get your address');
    const [errorMsg, setErrorMsg] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    /**
     * Solicita permisos y obtiene la ubicación actual de alta precisión.
     * 
     * @description Realiza el flujo completo: Permission -> GetLocation -> ReverseGeocode.
     * Maneja errores y estados de carga automáticamente.
     * 
     * @complexity O(1) - Network bound
     * @param {Function} [onLocationFound] - Callback ejecutado al éxito con data {coords, address}.
     * @param {Function} [showAlert] - Inyección de depdendencia para feedback UI (opcional).
     */
    const getUserLocation = useCallback(async (onLocationFound, showAlert) => {
        setIsLocating(true);
        setErrorMsg(null);

        try {
            // 1. Verificación de Permisos
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                const msg = 'Permission Required: Location access is needed.';
                setErrorMsg(msg);
                if (showAlert) showAlert('Permission Denied', msg, [{ text: 'OK' }], 'location-outline');
                return null;
            }

            // 2. Obtención de Coordenadas
            const userLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            setLocation(userLocation);

            // 3. Geocodificación Inversa (Coords -> Dirección legible)
            const [result] = await Location.reverseGeocodeAsync({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
            });

            if (result) {
                // Formateo robusto de dirección
                const readableAddress = [
                    result.street || result.name,
                    result.city,
                    result.country
                ].filter(Boolean).join(', ');

                setAddress(readableAddress);

                const locationData = {
                    coords: userLocation.coords,
                    address: readableAddress,
                    timestamp: Date.now()
                };

                // Callback para efectos secundarios externos
                if (onLocationFound) onLocationFound(locationData);
            }
        } catch (error) {
            console.error('[useUserLocation] Error:', error);
            setErrorMsg('Error retrieving location');
            if (showAlert) showAlert('Location Error', 'Could not retrieve your location.', [{ text: 'OK' }], 'alert-circle-outline');
        } finally {
            setIsLocating(false);
        }
    }, [location]); // Dependencia para useCallback, aunque location cambia, la ref de la función es estable.

    return {
        // State
        location,
        address,
        isLocating,
        errorMsg,
        // Methods
        getUserLocation,
        setLocation,
        setAddress
    };
};
