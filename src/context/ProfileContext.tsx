import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { ParrotProfile } from '../types';
import { ProfileRepository } from '../database/repository';
import { WebProfileRepository } from '../database/webRepository';
import { StorageService } from '../services/StorageService';

import { useAuth } from './AuthContext';

// Use web repository on web, native repository on native platforms
const ActiveProfileRepository = Platform.OS === 'web' ? WebProfileRepository : ProfileRepository;

interface ProfileContextType {
    activeProfile: ParrotProfile | null;
    allProfiles: ParrotProfile[];
    switchProfile: (profileId: string) => Promise<void>;
    addProfile: (profile: Omit<ParrotProfile, 'id' | 'createdAt'>) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
    refreshProfiles: () => Promise<void>;
    isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const ACTIVE_PROFILE_KEY = 'active_profile_id';

interface ProfileProviderProps {
    children: ReactNode;
    initialProfiles?: ParrotProfile[];
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children, initialProfiles }) => {
    const { user } = useAuth();
    const [activeProfile, setActiveProfile] = useState<ParrotProfile | null>(null);
    const [allProfiles, setAllProfiles] = useState<ParrotProfile[]>(initialProfiles || []);
    const [isLoading, setIsLoading] = useState(!initialProfiles);

    useEffect(() => {
        // Re-load profiles whenever the user changes (e.g. after a redirect/re-login)
        console.log('ProfileContext: Auth user changed, refreshing profiles...', { hasUser: !!user });
        loadProfiles();
    }, [user]);

    // CRITICAL: Always load profiles on mount, even if initialProfiles is provided
    useEffect(() => {
        console.log('ProfileContext: Component mounted, loading profiles...');
        loadProfiles();
    }, []);

    // Sync state with initialProfiles if they change from parent (e.g. during boot)
    useEffect(() => {
        if (initialProfiles && initialProfiles.length > 0 && allProfiles.length === 0) {
            console.log('ProfileContext: Syncing allProfiles with initialProfiles prop:', initialProfiles.length);
            setAllProfiles(initialProfiles);
            if (!activeProfile) {
                initializeActiveProfile(initialProfiles);
            }
        }
    }, [initialProfiles]);

    const initializeActiveProfile = async (profiles: ParrotProfile[]) => {
        try {
            setIsLoading(true);
            if (profiles.length > 0) {
                const savedProfileId = await StorageService.getItem(ACTIVE_PROFILE_KEY);

                if (savedProfileId) {
                    const profile = profiles.find(p => p.id === savedProfileId);
                    if (profile) {
                        setActiveProfile(profile);
                    } else {
                        setActiveProfile(profiles[0]);
                        await StorageService.setItem(ACTIVE_PROFILE_KEY, profiles[0].id);
                    }
                } else {
                    setActiveProfile(profiles[0]);
                    await StorageService.setItem(ACTIVE_PROFILE_KEY, profiles[0].id);
                }
            } else {
                setActiveProfile(null);
            }
        } catch (error) {
            console.error('Error initializing active profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProfiles = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const profiles = await ActiveProfileRepository.getAll();
            console.log('ProfileContext: Loaded profiles:', profiles.length, profiles.map(p => p.displayName));
            setAllProfiles(profiles);

            if (profiles.length > 0) {
                // Try to load last active profile from storage
                const savedProfileId = await StorageService.getItem(ACTIVE_PROFILE_KEY);
                console.log('ProfileContext: Saved profile ID:', savedProfileId);

                if (savedProfileId) {
                    const profile = profiles.find(p => p.id === savedProfileId);
                    if (profile) {
                        console.log('ProfileContext: Setting active profile:', profile.displayName);
                        setActiveProfile(profile);
                    } else {
                        // Saved profile not found, use first one
                        console.log('ProfileContext: Saved profile not found, using first');
                        setActiveProfile(profiles[0]);
                        await StorageService.setItem(ACTIVE_PROFILE_KEY, profiles[0].id);
                    }
                } else {
                    // No saved profile, use first one
                    console.log('ProfileContext: No saved profile, using first');
                    setActiveProfile(profiles[0]);
                    await StorageService.setItem(ACTIVE_PROFILE_KEY, profiles[0].id);
                }
            } else {
                setActiveProfile(null);
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Safety net: If we have profiles but no active profile (and not loading), set the first one.
    useEffect(() => {
        if (!isLoading && allProfiles.length > 0 && !activeProfile) {
            console.log('ProfileContext: Safety net triggered - setting first profile as active');
            setActiveProfile(allProfiles[0]);
            StorageService.setItem(ACTIVE_PROFILE_KEY, allProfiles[0].id).catch(console.error);
        }
    }, [isLoading, allProfiles, activeProfile]);

    const switchProfile = async (profileId: string) => {
        const profile = allProfiles.find(p => p.id === profileId);
        if (profile) {
            console.log('ProfileContext: Switching to profile:', profile.displayName);
            setActiveProfile(profile);
            await StorageService.setItem(ACTIVE_PROFILE_KEY, profileId);
        }
    };

    const addProfile = async (profileData: Omit<ParrotProfile, 'id' | 'createdAt'>) => {
        try {
            console.log('ProfileContext: Adding profile:', profileData.displayName);
            // Create in repo and get ID
            const newId = await ActiveProfileRepository.create(profileData);

            if (!newId) throw new Error("Repository returned no ID");

            // Construct full profile object for immediate local state update
            const newProfile: ParrotProfile = {
                ...profileData,
                id: newId,
                createdAt: Date.now() // Close enough for immediate UI display
            };

            // Update local state immediately to avoid race conditions
            await StorageService.setItem(ACTIVE_PROFILE_KEY, newId);
            setActiveProfile(newProfile);

            await refreshProfiles();
        } catch (e) {
            console.error('ProfileContext: Failed to add profile', e);
            throw e; // Re-throw so UI can handle it
        }
    };

    const deleteProfile = async (profileId: string) => {
        console.log('ProfileContext: Deleting profile:', profileId);
        await ActiveProfileRepository.delete(profileId);

        // If we deleted the active profile, switch to another one
        if (activeProfile?.id === profileId) {
            const remainingProfiles = allProfiles.filter(p => p.id !== profileId);
            if (remainingProfiles.length > 0) {
                await switchProfile(remainingProfiles[0].id);
            } else {
                setActiveProfile(null);
                // Clear from storage - note: StorageService may not have removeItem
                try {
                    await StorageService.setItem(ACTIVE_PROFILE_KEY, '');
                } catch (e) {
                    console.warn('Could not clear profile storage');
                }
            }
        }

        await refreshProfiles();
    };

    const refreshProfiles = async () => {
        console.log('ProfileContext: Refreshing profiles...');
        await loadProfiles(true); // Silent refresh by default when called manually
    };

    const value: ProfileContextType = {
        activeProfile,
        allProfiles,
        switchProfile,
        addProfile,
        deleteProfile,
        refreshProfiles,
        isLoading,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfileContext = (): ProfileContextType => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfileContext must be used within a ProfileProvider');
    }
    return context;
};
