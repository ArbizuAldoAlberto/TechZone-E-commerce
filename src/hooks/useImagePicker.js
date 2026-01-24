import { useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export const useImagePicker = (initialImage = null) => {
    const [image, setImage] = useState(initialImage);
    const [isCompressing, setIsCompressing] = useState(false);

    // Compress image before saving
    const compressImage = async (uri) => {
        try {
            setIsCompressing(true);
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 500 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipResult.uri;
        } catch (error) {
            console.error("Compression error:", error);
            return uri;
        } finally {
            setIsCompressing(false);
        }
    };

    const verifyCameraPermissions = async (showAlert) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            if (showAlert) showAlert('Permission Required', 'Camera access is needed to take photos.', [{ text: 'OK' }], 'camera-outline');
            return false;
        }
        return true;
    };

    const verifyGalleryPermissions = async (showAlert) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            if (showAlert) showAlert('Permission Required', 'Gallery access is needed to select photos.', [{ text: 'OK' }], 'images-outline');
            return false;
        }
        return true;
    };

    const pickImage = async (source, onImageSelected, showAlert) => {
        let hasPermission;
        let result;

        if (source === 'camera') {
            hasPermission = await verifyCameraPermissions(showAlert);
            if (!hasPermission) return;
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
        } else {
            hasPermission = await verifyGalleryPermissions(showAlert);
            if (!hasPermission) return;
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });
        }

        if (!result.canceled && result.assets && result.assets[0]) {
            const compressedUri = await compressImage(result.assets[0].uri);
            setImage(compressedUri);
            if (onImageSelected) onImageSelected(compressedUri);
        }
    };

    return {
        image,
        setImage,
        isCompressing,
        pickImage,
    };
};
