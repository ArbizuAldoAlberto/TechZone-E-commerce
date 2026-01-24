import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { colors, getColors } from '../../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

/**
 * CustomAlert - Cross-platform alert component that works on web and mobile
 * Uses Modal for web compatibility instead of native Alert
 */
const CustomAlert = ({
    visible,
    title,
    message,
    buttons = [{ text: 'OK' }],
    onClose,
    icon = null
}) => {
    const isDarkMode = useSelector(state => state.theme?.isDarkMode || false);
    const themeColors = getColors(isDarkMode);

    const handleButtonPress = (button) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onClose) {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.alertContainer, isDarkMode && styles.alertContainerDark]}>
                    {/* Icon */}
                    {icon && (
                        <View style={[styles.iconContainer, { backgroundColor: `${themeColors.primary}15` }]}>
                            <Ionicons name={icon} size={32} color={themeColors.primary} />
                        </View>
                    )}

                    {/* Title */}
                    <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>

                    {/* Message */}
                    <ScrollView style={styles.messageScroll} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.message, { color: themeColors.textLight }]}>{message}</Text>
                    </ScrollView>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    button.style === 'destructive' && styles.destructiveButton,
                                    button.style === 'cancel' && [styles.cancelButton, isDarkMode && styles.cancelButtonDark],
                                    buttons.length === 1 && styles.singleButton,
                                ]}
                                onPress={() => handleButtonPress(button)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.buttonText,
                                    button.style === 'destructive' && styles.destructiveText,
                                    button.style === 'cancel' && [styles.cancelText, { color: themeColors.text }],
                                ]}>
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

/**
 * useCustomAlert - Hook for managing alert state
 */
export const useCustomAlert = () => {
    const [alertConfig, setAlertConfig] = React.useState({
        visible: false,
        title: '',
        message: '',
        buttons: [{ text: 'OK' }],
        icon: null,
    });

    const showAlert = (title, message, buttons = [{ text: 'OK' }], icon = null) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons,
            icon,
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    return {
        alertConfig,
        showAlert,
        hideAlert,
    };
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertContainer: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
            },
            android: {
                elevation: 10,
            },
            web: {
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
            },
        }),
    },
    alertContainerDark: {
        backgroundColor: '#1C1C1E',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    messageScroll: {
        maxHeight: 200,
        marginBottom: 20,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    singleButton: {
        minWidth: 120,
    },
    destructiveButton: {
        backgroundColor: colors.error,
    },
    cancelButton: {
        backgroundColor: '#F2F2F7',
    },
    cancelButtonDark: {
        backgroundColor: '#2C2C2E',
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    destructiveText: {
        color: colors.white,
    },
    cancelText: {
        color: colors.text,
    },
});

export default CustomAlert;
