import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

/**
 * @fileoverview Authentication Service (Firebase Implementation)
 * @description Centralizes all Auth interactions (Sign Up, Sign In, Reset).
 * Handles Firestore Profile creation/merging and error translation.
 */

/**
 * Creates a new user in Firebase Auth and a corresponding profile in Firestore.
 * 
 * @param {string} email - User's email address.
 * @param {string} password - User's password (min 6 chars).
 * @param {string} name - User's full display name.
 * @returns {Promise<{email: string, idToken: string, localId: string, displayName: string, role: string}>} Authenticated user session data.
 * @throws {Error} If email exists, password is weak, or network fails.
 */
export const signUp = async (email, password, name) => {
    try {
        // 1. Auth Creation
        const { user } = await createUserWithEmailAndPassword(auth, email, password);

        // 2. Profile Creation (Firestore)
        const userProfile = {
            name,
            email,
            role: 'user',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true,
            favorites: [],
            settings: { notifications: true, newsletter: true, theme: 'system' }
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);

        // 3. Return Session
        return {
            email: user.email,
            token: await user.getIdToken(),
            localId: user.uid,
            displayName: name,
            role: 'user'
        };
    } catch (error) {
        throw new Error(mapAuthError(error.code));
    }
};

/**
 * Authenticates an existing user and retrieves their extended profile.
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{email: string, idToken: string, localId: string, displayName: string, role: string, photoURL: ?string}>}
 * @throws {Error} If credentials are invalid or account is disabled.
 */
export const signIn = async (email, password) => {
    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const token = await user.getIdToken();

        // Fetch Profile for Role/Name
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const profile = userDoc.exists() ? userDoc.data() : {};

        return {
            email: user.email,
            token: token,
            localId: user.uid,
            displayName: profile.name || user.displayName || 'User',
            role: profile.role || 'user',
            photoURL: profile.photoURL || null
        };
    } catch (error) {
        throw new Error(mapAuthError(error.code));
    }
};

/**
 * Sends a password reset email to the provided address.
 * 
 * @param {string} email 
 * @returns {Promise<{email: string}>}
 * @throws {Error} If email is invalid or user not found.
 */
export const sendPasswordResetEmail = async (email) => {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
        return { email };
    } catch (error) {
        throw new Error(mapAuthError(error.code));
    }
};

/**
 * Maps extensive Firebase Error Codes to user-friendly messages.
 * @private
 * @param {string} code - Firebase error code (e.g. 'auth/user-not-found')
 * @returns {string} Human readable message.
 */
const mapAuthError = (code) => {
    const messages = {
        'auth/email-already-in-use': 'Email already registered.',
        'auth/user-not-found': 'Account not found.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-email': 'Invalid email format.',
        'auth/user-disabled': 'Account disabled.',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/network-request-failed': 'No internet connection.',
        'auth/weak-password': 'Password too weak (min 6 chars).',
        'auth/invalid-credential': 'Invalid credentials.'
    };
    return messages[code] || `Authentication error (${code}).`;
};
