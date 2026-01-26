/**
 * @fileoverview Registration Screen
 * @description User signup form with name, email, password validation.
 * Creates user in Firebase Auth + Firestore and initiates session.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setUser } from '../../store/authSlice';
import { insertSession } from '../../db';
import { signUp } from '../../services/authService';
import { colors } from '../../global/colors';
import InputField from '../../components/common/InputField';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';
import { registerSchema } from '../../utils/validationSchemas';

const Register = ({ navigation }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    const { control, handleSubmit, formState: { errors, isValid }, setValue, watch } = useForm({
        resolver: yupResolver(registerSchema),
        mode: 'onChange',
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
        }
    });

    const acceptTerms = watch('acceptTerms');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const user = await signUp(data.email, data.password, data.name);
            dispatch(setUser(user));
            await insertSession(user);
            showAlert('Account Created!', 'Your account has been created successfully.', [{ text: 'OK' }], 'checkmark-circle-outline');
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
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>Create Account</Text>
                            <Text style={styles.headerSubtitle}>Fill in your details to get started</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="Full Name"
                                    placeholder="Enter your full name"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.name?.message}
                                    icon="person-outline"
                                    autoCapitalize="words"
                                />
                            )}
                        />

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

                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="Password"
                                    placeholder="Create a password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.password?.message}
                                    secureTextEntry={!showPassword}
                                    icon="lock-closed-outline"
                                    rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                    onRightIconPress={() => setShowPassword(!showPassword)}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="Confirm Password"
                                    placeholder="Confirm your password"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.confirmPassword?.message}
                                    secureTextEntry={!showConfirmPassword}
                                    icon="lock-closed-outline"
                                    rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                                    onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            )}
                        />

                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setValue('acceptTerms', !acceptTerms)}
                        >
                            <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                                {acceptTerms && <Ionicons name="checkmark" size={14} color={colors.white} />}
                            </View>
                            <Text style={styles.termsText}>
                                I accept the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>
                        {errors.acceptTerms && <Text style={styles.termsError}>{errors.acceptTerms.message}</Text>}

                        <TouchableOpacity
                            style={[styles.registerButton, (!isValid || isLoading) && styles.registerButtonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            disabled={!isValid || isLoading}
                        >
                            <Text style={styles.registerButtonText}>
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </Text>
                            {!isLoading && <Ionicons name="arrow-forward" size={20} color={colors.white} />}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.linkText}>Sign In</Text>
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
    keyboardView: { flex: 1 },
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
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textLight,
    },
    formContainer: { flex: 1 },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 16,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    termsText: {
        flex: 1,
        fontSize: 14,
        color: colors.text,
        lineHeight: 22,
    },
    termsLink: {
        color: colors.primary,
        fontWeight: '600',
    },
    termsError: {
        fontSize: 12,
        color: colors.error,
        marginTop: -10,
        marginBottom: 10,
    },
    registerButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 10,
        ...Platform.select({
            ios: {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: { elevation: 8 },
            web: { boxShadow: `0px 4px 10px ${colors.primary}4D` }
        })
    },
    registerButtonDisabled: { opacity: 0.6 },
    registerButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginRight: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 30,
    },
    footerText: {
        color: colors.textLight,
        fontSize: 14,
    },
    linkText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
});

export default Register;
