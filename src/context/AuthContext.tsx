import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Config } from '../config';

WebBrowser.maybeCompleteAuthSession();

// Simplified User interface for local usage
interface User {
    uid: string;
    email: string | null;
    displayName?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithApple: () => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Configure Google Sign-In
        console.error('🔵 Configuring Google Sign-In...');
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Use the new project ID dynamically
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, // Needs to be set in Codemagic or .env
            scopes: ['email', 'profile'],
            offlineAccess: true,
            forceCodeForRefreshToken: true,
        });
        console.error('✅ Google Sign-In Configured');

        // Check for existing Firebase auth session
        const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName
            });
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (email: string, password: string) => {
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(email, password);
            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName
            });
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        try {
            // console.log('🔵 Authenticating with Google...');
            console.log('🔵 Authenticating with Google...');

            // Checks if play services are available (Android only)
            if (Platform.OS === 'android') {
                await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
                console.log('✅ Google Play Services available');
            }

            // Get user ID token
            const signInResult = await GoogleSignin.signIn();
            console.error('✅ Google Sign-In completed:', JSON.stringify(signInResult, null, 2));

            // Hybrid check for v16+ (nested) and legacy (flat) structures
            let idToken = signInResult.data?.idToken;
            if (!idToken && (signInResult as any).idToken) {
                idToken = (signInResult as any).idToken;
            }

            console.error('🔑 ID Token received:', idToken ? 'Yes' : 'No');

            if (!idToken) {
                throw new Error('No ID token received from Google Sign-In response: ' + JSON.stringify(signInResult));
            }

            // Use native GoogleAuthProvider credential
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
            console.error('✅ Firebase credential created natively');

            // Sign in with credential
            const userCredential = await auth().signInWithCredential(googleCredential);
            console.error('✅ Firebase sign-in successful:', userCredential.user.email);

            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName
            });

            Alert.alert('Success', `Welcome ${userCredential.user.displayName || userCredential.user.email}!`);
        } catch (error: any) {
            console.error('❌ Google Sign-In Error Details:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));

            if (error.code === '12501') {
                // User cancelled
                console.log('User cancelled Google Sign-In');
            } else {
                Alert.alert(
                    'Sign-In Failed',
                    `Unable to sign in with Google: ${JSON.stringify(error)}\n\nPlease try again or use email signup.`
                );
            }
            throw error;
        }
    };

    const loginWithApple = async () => {
        try {
            if (Platform.OS !== 'ios') {
                Alert.alert('Not Supported', 'Apple Sign-In is only available on iOS devices.');
                return;
            }

            console.error('🔵 Authenticating with Apple...');

            const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const { identityToken } = appleAuthRequestResponse;

            if (!identityToken) {
                throw new Error('Apple Sign-In failed: No identity token received');
            }

            // Create a Firebase credential with the token
            const appleCredential = auth.AppleAuthProvider.credential(identityToken);

            // Sign in with the credential
            const userCredential = await auth().signInWithCredential(appleCredential);
            console.error('✅ Firebase Apple sign-in successful:', userCredential.user.email);

            setUser({
                uid: userCredential.user.uid,
                email: userCredential.user.email,
                displayName: userCredential.user.displayName
            });

            Alert.alert('Success', `Welcome ${userCredential.user.displayName || userCredential.user.email}!`);
        } catch (error: any) {
            console.error('❌ Apple Sign-In Error:', error);
            if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
                console.log('User cancelled Apple Sign-In');
            } else {
                Alert.alert(
                    'Sign-In Failed',
                    `Unable to sign in with Apple: ${error.message}`
                );
            }
            throw error;
        }
    };

    const logout = async () => {
        try {
            await GoogleSignin.signOut();
            await auth().signOut();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const deleteAccount = async () => {
        try {
            const currentUser = auth().currentUser;
            if (currentUser) {
                await currentUser.delete();
            }
            await GoogleSignin.signOut();
            setUser(null);
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, loginWithApple, logout, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
