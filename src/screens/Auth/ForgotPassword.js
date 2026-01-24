import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { sendPasswordResetEmail } from '../../services/authService';
import { colors } from '../../global/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputField from '../../components/common/InputField';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

// Validation schema
const forgotSchema = yup.object().shape({
    email: yup
        .string()
        .email('Invalid email format')
        .required('Email is required'),
});

const ForgotPassword = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    const { control, handleSubmit, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(forgotSchema),
        mode: 'onChange',
        defaultValues: { email: '' }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await sendPasswordResetEmail(data.email);
            setEmailSent(true);
            showAlert(
                'Email Sent!',
                'We have sent you a link to reset your password. Please check your inbox.',
                [{ text: 'OK', onPress: () => navigation.goBack() }],
                'mail-outline'
            );
        } catch (error) {
            showAlert('Error', error.message, [{ text: 'OK' }], 'alert-circle-outline');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <CustomAlert {...alertConfig} onClose={hideAlert} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Reset Password</Text>
                            <Text style={styles.headerSubtitle}>
                                Enter your email address and we'll send you a link to reset your password.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <Ionicons name="mail-unread-outline" size={80} color={colors.primary} />
                        </View>

                        {/* Email Input */}
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="Email"
                                    placeholder="Enter your email"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.email?.message}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon="mail-outline"
                                />
                            )}
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[styles.submitButton, (!isValid || isLoading) && styles.submitButtonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid || isLoading}
                        >
                            <Text style={styles.submitButtonText}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Text>
                            {!isLoading && <Ionicons name="send" size={20} color={colors.white} />}
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.linkText}>← Back to Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginTop: 10,
        marginBottom: 30,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTextContainer: {},
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textLight,
        lineHeight: 22,
    },
    formContainer: {
        flex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 20,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: `0 4px 10px ${colors.primary}4D`,
            }
        })
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
        marginRight: 10,
    },
    footer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    linkText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});

export default ForgotPassword;
