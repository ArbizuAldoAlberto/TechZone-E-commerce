/**
 * @fileoverview Registration Screen
 * @module screens/Auth/Register
 * @description Handles new account creation. validation, service calls, and
 * session initialization. Features consistent Elite UI styling.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Logic
import { setUser } from '../../store/authSlice';
import { insertSession } from '../../db';
import { signUp } from '../../services/authService';
import { colors } from '../../global/colors';
import { registerSchema } from '../../utils/validationSchemas';

// Components
import ParticlesBackground from '../../components/3d/ParticlesBackground';
import InputField from '../../components/common/InputField';
import CustomAlert, { useCustomAlert } from '../../components/common/CustomAlert';

const Register = ({ navigation }) => {
    const dispatch = useDispatch();
    const { alertConfig, showAlert, hideAlert } = useCustomAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handleRegister = async (data) => {
        setIsLoading(true);
        try {
            const user = await signUp(data.email, data.password, data.name);
            dispatch(setUser(user));
            await insertSession(user);
            showAlert('Account Created!', 'Your account has been created successfully.', [{ text: 'OK' }], 'checkmark-circle-outline');
        } catch (error) {
            showAlert('Registration Error', error.message || 'Could not create account', [{ text: 'OK' }], 'alert-circle-outline');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <ParticlesBackground />
            <CustomAlert {...alertConfig} onClose={hideAlert} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <SafeAreaView style={styles.header}>
                        <TouchableOpacity style={styles.glassButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={24} color={colors.white} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, marginLeft: 20 }}>
                            <Text style={styles.headerTitle}>Create Account</Text>
                            <Text style={styles.headerSubtitle}>Join the future of tech.</Text>
                        </View>
                    </SafeAreaView>

                    <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.glassContainer}>

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
                                    darkMode
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
                                    placeholder="Create a password"
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
                                    darkMode
                                />
                            )}
                        />

                        <TouchableOpacity
                            style={styles.termsContainer}
                            onPress={() => setValue('acceptTerms', !acceptTerms)}
                            activeOpacity={0.8}
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
                            onPress={handleSubmit(handleRegister)}
                            disabled={!isValid || isLoading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.registerButtonText}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
                            {!isLoading && <Ionicons name="arrow-forward" size={20} color={colors.white} />}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.linkText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050510' },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 30 },
    glassButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    headerTitle: { fontSize: 28, fontWeight: '800', color: colors.white, marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
    glassContainer: { backgroundColor: 'rgba(20, 20, 30, 0.7)', borderRadius: 30, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 }, web: { backdropFilter: 'blur(20px)' } }) },
    termsContainer: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 16 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
    checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
    termsText: { flex: 1, fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
    termsLink: { color: colors.primary, fontWeight: '600' },
    termsError: { fontSize: 12, color: colors.error, marginTop: -10, marginBottom: 10 },
    registerButton: { backgroundColor: colors.primary, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16, marginTop: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
    registerButtonDisabled: { opacity: 0.6 },
    registerButtonText: { color: colors.white, fontSize: 18, fontWeight: '700', marginRight: 10 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, marginBottom: 10 },
    footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
    linkText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
});

export default Register;
