import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';
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
            webClientId: "337832765264-8t7dmf1gahnfo7oqt510eib973ctnlp2.apps.googleusercontent.com", // Hardcoded for debugging
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
            Alert.alert('DEBUG', 'Function called!'); // IMMEDIATE diagnostic
            console.log('🔵 Authenticating with Google...');

            // Checks if play services are available
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            console.log('✅ Google Play Services available');

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

            // WORKAROUND: Manually create credential object to bypass GoogleAuthProvider issues
            // This is what GoogleAuthProvider.credential() does internally
            const googleCredential: any = {
                token: idToken,
                secret: null,
                providerId: 'google.com'
            };
            console.error('✅ Firebase credential created manually:', googleCredential);

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
        console.log("Apple Login not yet implemented");
        // TODO: Implement Apple Sign-In
        throw new Error("Apple Sign-In not implemented");
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
