/**
 * @fileoverview Login Screen
 * @description Authentication entry point. Supports email/password login and demo mode.
 * Persists session locally (SQLite) and globally (Redux).
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
import { signIn } from '../../services/authService';
import { colors } from '../../global/colors';
import InputField from '../../components/common/InputField';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';
import { loginSchema } from '../../utils/validationSchemas';

const Auth = ({ navigation }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();

    const { control, handleSubmit, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onChange',
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const user = await signIn(data.email, data.password);
            dispatch(setUser(user));
            await insertSession(user);
        } catch (error) {
            showAlert('Authentication Error', error.message, [{ text: 'OK' }], 'alert-circle-outline');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        const user = { email: 'demo@techzone.io', token: 'demo-token', localId: 'demo-id' };
        dispatch(setUser(user));
        try {
            await insertSession(user);
        } catch {
            // Silently fail session save for demo
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <CustomAlert {...alertConfig} onClose={hideAlert} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={Platform.OS === 'web' ? styles.webContainer : null}>
                        <View style={styles.topSection}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="flash" size={60} color={colors.white} />
                            </View>
                            <Text style={styles.title}>TechZone</Text>
                            <Text style={styles.subtitle}>Your Premium Tech Hub</Text>
                        </View>

                        <View style={styles.bottomSection}>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.instructionText}>
                                Log in to access your dashboard and shop the latest tech.
                            </Text>

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
                                        placeholder="Enter your password"
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

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, (!isValid || isLoading) && styles.loginButtonDisabled]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={!isValid || isLoading}
                            >
                                <Text style={styles.loginButtonText}>
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Text>
                                {!isLoading && <Ionicons name="arrow-forward" size={20} color={colors.white} />}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
                                <Text style={styles.demoButtonText}>Enter as Demo User</Text>
                            </TouchableOpacity>

                            <View style={styles.registerSection}>
                                <View style={styles.registerDivider} />
                                <Text style={styles.registerPromptText}>New to TechZone?</Text>
                                <TouchableOpacity
                                    style={styles.registerButton}
                                    onPress={() => navigation.navigate('Register')}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="person-add-outline" size={20} color={colors.white} />
                                    <Text style={styles.registerButtonText}>Create New Account</Text>
                                    <Ionicons name="arrow-forward" size={18} color={colors.white} />
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: colors.primary,
    },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        ...(Platform.OS === 'web' && {
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
        }),
    },
    webContainer: {
        width: '100%',
        maxWidth: 480,
        alignSelf: 'center',
    },
    topSection: {
        ...(Platform.OS === 'web' ? { paddingVertical: 40 } : { flex: 0.4 }),
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.white,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    bottomSection: {
        ...(Platform.OS === 'web' ? { paddingVertical: 40 } : { flex: 0.6 }),
        backgroundColor: colors.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 30,
        paddingTop: 40,
        ...(Platform.OS === 'web' && {
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.15)',
        }),
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: colors.textLight,
        lineHeight: 22,
        marginBottom: 30,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 12,
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
    loginButtonDisabled: { opacity: 0.6 },
    loginButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
        marginRight: 10,
    },
    demoButton: {
        backgroundColor: colors.background,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 16,
        marginBottom: 20,
    },
    demoButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    registerSection: {
        marginTop: 24,
        paddingTop: 24,
        paddingBottom: 20,
        alignItems: 'center',
    },
    registerDivider: {
        width: 60,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        marginBottom: 16,
    },
    registerPromptText: {
        color: colors.textLight,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 16,
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: colors.success,
        gap: 10,
        width: '100%',
        ...Platform.select({
            ios: {
                shadowColor: colors.success,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
            },
            android: { elevation: 6 },
        }),
    },
    registerButtonText: {
        color: colors.white,
        fontSize: 17,
        fontWeight: '700',
    },
});

export default Auth;
