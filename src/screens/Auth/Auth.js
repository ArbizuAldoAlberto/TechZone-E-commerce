/**
 * @fileoverview Login Screen (TechZone Elite)
 * @description Immersive authentication entry point with particle effects and glassmorphism.
 * Handles user login, demo access, and navigation to registration.
 * 
 * @module screens/Auth
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Logic & Data
import { setUser } from '../../store/authSlice';
import { insertSession } from '../../db';
import { signIn } from '../../services/authService';
import { colors } from '../../global/colors';
import { loginSchema } from '../../utils/validationSchemas';
import { theme } from '../../global/theme';
import { fonts } from '../../global/fonts';

// Components
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

/**
 * @component Auth
 * @description Authentication screen component.
 * @param {object} props - Component props.
 * @param {object} props.navigation - React Navigation prop.
 */
const Auth = ({ navigation }) => {
    const dispatch = useDispatch();
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors, isValid } } = useForm({
        resolver: yupResolver(loginSchema),
        mode: 'onChange',
        defaultValues: { email: '', password: '' }
    });

    /**
     * @function processLogin
     * @description Handles state updates and session persistence after successful login.
     * @param {object} userPayload - User data object.
     */
    const processLogin = async (userPayload) => {
        dispatch(setUser(userPayload));
        try {
            await insertSession(userPayload);
        } catch (e) {
            console.warn('Session persistence failed', e);
        }
    };

    const handleLogin = async (data) => {
        setIsLoading(true);
        try {
            const user = await signIn(data.email, data.password);
            await processLogin(user);
        } catch (error) {
            showAlert('Authentication Error', error.message || 'Invalid credentials', [{ text: 'OK' }], 'alert-circle-outline');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        await processLogin({
            email: 'demo@techzone.io',
            token: 'demo-token-mock',
            localId: 'demo-user-id'
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ParticlesBackground />
            <CustomAlert {...alertConfig} onClose={hideAlert} />

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Brand Section */}
                        <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.topSection}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="flash" size={48} color={colors.primary} />
                            </View>
                            <Text style={styles.title}>TechZone</Text>
                            <Text style={styles.subtitle}>ELITE COMMERCE</Text>
                        </Animated.View>

                        {/* Glass Form Card */}
                        <Animated.View entering={FadeInUp.duration(1000).delay(200).springify()} style={styles.glassContainer}>
                            <Text style={styles.welcomeText}>Welcome Back</Text>
                            <Text style={styles.instructionText}>Login to access your dashboard.</Text>

                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        label="Email"
                                        placeholder="name@example.com"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.email?.message}
                                        keyboardType="email-address"
                                        icon="mail-outline"
                                        darkMode
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <InputField
                                        label="Password"
                                        placeholder="Enter password"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.password?.message}
                                        secureTextEntry={!showPassword}
                                        icon="lock-closed-outline"
                                        rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                                        onRightIconPress={() => setShowPassword(!showPassword)}
                                        darkMode
                                    />
                                )}
                            />

                            <TouchableOpacity
                                style={styles.forgotPassword}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            <View style={styles.actions}>
                                <Button
                                    title="Sign In"
                                    onPress={handleSubmit(handleLogin)}
                                    loading={isLoading}
                                    disabled={!isValid}
                                    type="primary"
                                    icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
                                    style={styles.mainButton}
                                />

                                <Button
                                    title="Demo Mode"
                                    onPress={handleDemoLogin}
                                    type="secondary"
                                    icon={<Ionicons name="key-outline" size={18} color={colors.white} />}
                                />

                                <View style={styles.divider}>
                                    <View style={styles.line} />
                                    <Text style={styles.orText}>OR</Text>
                                    <View style={styles.line} />
                                </View>

                                <Button
                                    title="Create Account"
                                    onPress={() => navigation.navigate('Register')}
                                    type="outline"
                                    icon={<Ionicons name="person-add-outline" size={18} color={colors.primary} />}
                                />
                            </View>

                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050510'
    },
    keyboardView: {
        flex: 1
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xl
    },
    topSection: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    title: {
        fontSize: 32,
        fontFamily: fonts.bold,
        color: colors.white,
        letterSpacing: 1
    },
    subtitle: {
        fontSize: 12,
        color: colors.primary,
        fontFamily: fonts.medium,
        letterSpacing: 4,
        marginTop: 4
    },
    glassContainer: {
        backgroundColor: 'rgba(20, 20, 30, 0.75)',
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        ...Platform.select({
            web: { backdropFilter: 'blur(20px)' }
        })
    },
    welcomeText: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.white,
        marginBottom: 8,
        textAlign: 'center'
    },
    instructionText: {
        fontSize: 14,
        color: '#A1A1AA',
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
        fontFamily: fonts.regular
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.lg,
        marginTop: -theme.spacing.sm
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 13,
        fontFamily: fonts.medium
    },
    actions: {
        gap: theme.spacing.md
    },
    mainButton: {
        marginBottom: theme.spacing.xs
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.sm
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    orText: {
        color: '#71717A',
        fontSize: 12,
        marginHorizontal: theme.spacing.md,
        fontFamily: fonts.medium
    }
});

export default Auth;
