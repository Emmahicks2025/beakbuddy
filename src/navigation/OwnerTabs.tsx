import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getSpeciesImage } from '../utils/imageMap';
import { useProfileContext } from '../context/ProfileContext';

// Import tab screens
import SearchTab from '../screens/owner/SearchTab';
import ScanTab from '../screens/owner/ScanTab';
import ShoppingListScreen from '../screens/owner/ShoppingListScreen';
import CareTab from '../screens/owner/CareTab';
import ProfileTab from '../screens/owner/ProfileTab';

const Tab = createBottomTabNavigator();

interface OwnerTabsProps {
    onBackToStart: () => void;
}

// Simple emoji icon component that works everywhere
const EmojiTabIcon = ({ emoji, isActive }: { emoji: string; isActive: boolean; color: string }) => (
    <Text style={{
        fontSize: 28,
        opacity: isActive ? 1 : 0.6,
        textAlign: 'center',
        lineHeight: Platform.OS === 'android' ? 34 : undefined,
    }}>
        {emoji}
    </Text>
);

export const OwnerTabs: React.FC<OwnerTabsProps> = ({ onBackToStart }) => {
    const { theme } = useTheme();
    const { activeProfile } = useProfileContext();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.glassBorder,
                    borderTopWidth: 1,
                    height: Platform.OS === 'ios' ? 88 : 90, // JUMBO SIZE FOR ANDROID
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                    paddingTop: 10,
                    ...theme.shadows.glass[theme.isDark ? 'dark' : 'light'],
                },
                tabBarItemStyle: {
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    margin: 0,
                    padding: 0,
                },
                tabBarActiveTintColor: theme.colors.brand.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarLabelStyle: [theme.typography.caption, { fontWeight: '600', fontSize: 11 }],
                tabBarShowLabel: true,
                tabBarIconStyle: {
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    margin: 0,
                    padding: 0,
                },
                tabBarButton: (props) => (
                    <TouchableOpacity
                        {...props}
                        style={[
                            props.style,
                            {
                                backgroundColor: 'transparent',
                                borderWidth: 0,
                                borderRadius: 0,
                            }
                        ]}
                        activeOpacity={0.7}
                    />
                ),
                headerStyle: {
                    backgroundColor: theme.colors.surface,
                    borderBottomColor: theme.colors.glassBorder,
                    borderBottomWidth: 1,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: theme.typography.h3,
            }}
        >
            <Tab.Screen
                name="Search"
                component={SearchTab}
                options={{
                    title: 'Food Safety',
                    tabBarIcon: ({ focused, color }) => (
                        <EmojiTabIcon emoji="🥗" isActive={focused} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Scan"
                component={ScanTab}
                options={{
                    title: 'Scan',
                    tabBarIcon: ({ focused, color }) => (
                        <EmojiTabIcon emoji="📷" isActive={focused} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Lists"
                children={() => <ShoppingListScreen />}
                options={{
                    title: 'My Lists',
                    tabBarIcon: ({ focused, color }) => (
                        <EmojiTabIcon emoji="📋" isActive={focused} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Care"
                component={CareTab}
                options={{
                    title: 'Care',
                    tabBarIcon: ({ focused, color }) => (
                        <EmojiTabIcon emoji="❤️" isActive={focused} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <View style={[
                            styles.avatarContainer,
                            focused && { borderColor: theme.colors.brand.primary }
                        ]}>
                            {activeProfile ? (
                                <Image
                                    source={getSpeciesImage(activeProfile.avatarAsset)}
                                    style={styles.tabAvatar}
                                    resizeMode="cover"
                                />
                            ) : (
                                <EmojiTabIcon emoji="👤" isActive={focused} color="" />
                            )}
                        </View>
                    ),
                }}
            >
                {(props) => <ProfileTab {...props} onBackToStart={onBackToStart} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
    }
});

export default OwnerTabs;
