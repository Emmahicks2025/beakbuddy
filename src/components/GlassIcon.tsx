import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface GlassIconProps {
    emoji: string;
    size?: number;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'safe';
    containerStyle?: ViewStyle;
}

export const GlassIcon: React.FC<GlassIconProps> = ({
    emoji,
    size = 24,
    variant = 'primary',
    containerStyle,
}) => {
    const { theme } = useTheme();

    const getGradientColors = () => {
        switch (variant) {
            case 'primary': return [theme.colors.brand.primary + '30', theme.colors.brand.primary + '10'];
            case 'accent': return [theme.colors.brand.accent + '30', theme.colors.brand.accent + '10'];
            case 'danger': return [theme.colors.brand.toxic + '30', theme.colors.brand.toxic + '10'];
            case 'safe': return [theme.colors.brand.safe + '30', theme.colors.brand.safe + '10'];
            case 'secondary': return [theme.colors.surface, theme.colors.surface];
            default: return [theme.colors.brand.primary + '30', theme.colors.brand.primary + '10'];
        }
    };

    const containerSize = size * 1.8;

    return (
        <View style={containerStyle}>
            <LinearGradient
                colors={getGradientColors()}
                style={[
                    styles.container,
                    {
                        width: containerSize,
                        height: containerSize,
                        borderRadius: containerSize / 2,
                        borderColor: theme.colors.glassBorder,
                        borderWidth: 1,
                    },
                ]}
            >
                <Text style={{ fontSize: size }}>{emoji}</Text>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
