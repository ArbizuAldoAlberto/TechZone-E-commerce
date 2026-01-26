/**
 * @fileoverview Image Picker Hook with Compression
 * @description Provides camera/gallery access with automatic image compression.
 * Reduces image size to 500px width with 70% quality for optimal storage.
 */
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * @param {string|null} initialImage - Initial image URI (for hydration from Redux)
 * @returns {Object} { image, setImage, isCompressing, pickImage }
 */
export const useImagePicker = (initialImage = null) => {
    const [image, setImage] = useState(initialImage);
    const [isCompressing, setIsCompressing] = useState(false);

    /**
     * @description Compresses image to 500px width at 70% JPEG quality
     * @param {string} uri - Original image URI
     * @returns {Promise<string>} Compressed image URI (or original on error)
     */
    const compressImage = async (uri) => {
        try {
            setIsCompressing(true);
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 500 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipResult.uri;
        } catch {
            return uri;
        } finally {
            setIsCompressing(false);
        }
    };

    const verifyCameraPermissions = async (showAlert) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            showAlert?.('Permission Required', 'Camera access is needed to take photos.', [{ text: 'OK' }], 'camera-outline');
            return false;
        }
        return true;
    };

    const verifyGalleryPermissions = async (showAlert) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert?.('Permission Required', 'Gallery access is needed to select photos.', [{ text: 'OK' }], 'images-outline');
            return false;
        }
        return true;
    };

    /**
     * @description Opens camera or gallery based on source parameter
     * @param {'camera'|'gallery'} source - Image source
     * @param {Function} onImageSelected - Callback with compressed URI
     * @param {Function} showAlert - Alert function for permission errors
     */
    const pickImage = async (source, onImageSelected, showAlert) => {
        const hasPermission = source === 'camera'
            ? await verifyCameraPermissions(showAlert)
            : await verifyGalleryPermissions(showAlert);

        if (!hasPermission) return;

        const pickerOptions = {
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        };

        const result = source === 'camera'
            ? await ImagePicker.launchCameraAsync(pickerOptions)
            : await ImagePicker.launchImageLibraryAsync(pickerOptions);

        if (!result.canceled && result.assets?.[0]) {
            const compressedUri = await compressImage(result.assets[0].uri);
            setImage(compressedUri);
            onImageSelected?.(compressedUri);
        }
    };

    return { image, setImage, isCompressing, pickImage };
};
