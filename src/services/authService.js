import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

/**
 * Sign up a new user and create their profile in Firestore
 * @param {string} email 
 * @param {string} password 
 * @param {string} name 
 * @returns {Promise<{email: string, idToken: string, localId: string, role: string}>}
 */
export const signUp = async (email, password, name) => {
    try {
        // 1. Create Authentication User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Create User Profile in Firestore
        const userProfile = {
            name: name,
            email: email,
            role: 'user', // Default role
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            photoURL: null,
            phoneNumber: null,
            isActive: true,
            favorites: [], // Initialize empty favorites
            settings: {    // Initialize default settings
                notifications: true,
                newsletter: true,
                theme: 'system'
            }
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);

        // 3. Return user data formatted for the app
        return {
            email: user.email,
            idToken: await user.getIdToken(),
            localId: user.uid,
            displayName: name,
            role: 'user'
        };
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Sign in an existing user and fetch their profile
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{email: string, idToken: string, localId: string}>}
 */
export const signIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const token = await user.getIdToken();

        // Fetch user profile from Firestore to get name/role
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        // Merge auth data with profile data if it exists
        const profileData = userDoc.exists() ? userDoc.data() : {};

        return {
            email: user.email,
            idToken: token,
            localId: user.uid,
            displayName: profileData.name || user.displayName || 'User',
            role: profileData.role || 'user',
            photoURL: profileData.photoURL || null
        };
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise<{email: string}>}
 */
export const sendPasswordResetEmail = async (email) => {
    try {
        await firebaseSendPasswordResetEmail(auth, email);
        return { email };
    } catch (error) {
        throw new Error(getAuthErrorMessage(error.code));
    }
};

/**
 * Translate Firebase Auth error codes to user-friendly messages
 * @param {string} errorCode 
 * @returns {string}
 */
const getAuthErrorMessage = (errorCode) => {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/operation-not-allowed': 'Password sign-in is disabled.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/user-not-found': 'No account exists with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-credential': 'Incorrect email or password.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/configuration-not-found': 'Firebase Auth is not enabled. Please enable "Email/Password" provider in the Firebase Console.',
    };

    return errorMessages[errorCode] || `An error occurred (${errorCode}). Please try again.`;
};

