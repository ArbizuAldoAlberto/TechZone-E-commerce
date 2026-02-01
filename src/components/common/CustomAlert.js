/**
 * @fileoverview Custom Alert Modal
 * @module components/common/CustomAlert
 * @description A cross-platform, theme-aware alert system replacing native alerts.
 * Supports rich text, custom icons, and multiple action buttons.
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { colors, getColors } from '../../global/colors';

/**
 * @component
 * @description State-driven alert component.
 * @param {boolean} visible - Visibility state.
 * @param {string} title - Header text.
 * @param {string} message - Body text.
 * @param {Array} buttons - Action buttons [{ text, onPress, style: 'default'|'cancel'|'destructive' }].
 * @param {function} onClose - Dismiss handler.
 * @param {string} [icon] - Optional Ionicons name to display prominently.
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

    const handleAction = (button) => {
        if (button.onPress) button.onPress();
        if (onClose) onClose();
    };

    if (!visible) return null;

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={[styles.container, isDarkMode && styles.containerDark]}>
                    {icon && (
                        <View style={[styles.iconBadge, { backgroundColor: `${themeColors.primary}15` }]}>
                            <Ionicons name={icon} size={32} color={themeColors.primary} />
                        </View>
                    )}

                    <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>

                    <ScrollView style={styles.messageArea} showsVerticalScrollIndicator={false}>
                        <Text style={[styles.message, { color: themeColors.textLight }]}>{message}</Text>
                    </ScrollView>

                    <View style={styles.buttonStack}>
                        {buttons.map((btn, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.button,
                                    btn.style === 'destructive' && styles.btnDestructive,
                                    btn.style === 'cancel' && [styles.btnCancel, isDarkMode && styles.btnCancelDark],
                                    buttons.length === 1 && styles.btnSingle
                                ]}
                                onPress={() => handleAction(btn)}
                                activeOpacity={0.8}
                            >
                                <Text style={[
                                    styles.btnText,
                                    btn.style === 'destructive' && styles.textDestructive,
                                    btn.style === 'cancel' && [styles.textCancel, { color: themeColors.text }]
                                ]}>
                                    {btn.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const useCustomAlert = () => {
    const [alertConfig, setAlertConfig] = React.useState({
        visible: false,
        title: '',
        message: '',
        buttons: [],
        icon: null
    });

    const showAlert = (title, message, buttons = [{ text: 'OK' }], icon = null) => {
        setAlertConfig({ visible: true, title, message, buttons, icon });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    return { alertConfig, showAlert, hideAlert };
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    container: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24 },
            android: { elevation: 12 },
            web: { boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }
        })
    },
    containerDark: {
        backgroundColor: '#1C1C1E',
        borderWidth: 1,
        borderColor: '#2C2C2E'
    },
    iconBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8
    },
    messageArea: {
        maxHeight: 120,
        marginBottom: 24,
        width: '100%'
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22
    },
    buttonStack: {
        width: '100%',
        gap: 12
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnDestructive: {
        backgroundColor: colors.error
    },
    btnCancel: {
        backgroundColor: '#F2F2F7'
    },
    btnCancelDark: {
        backgroundColor: '#2C2C2E'
    },
    btnSingle: {
        minWidth: 140
    },
    btnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600'
    },
    textDestructive: {
        color: '#FFF'
    },
    textCancel: {
        color: '#000'
    }
});

export default CustomAlert;
