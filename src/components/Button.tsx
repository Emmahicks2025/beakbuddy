import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'premium';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
}) => {
    const { theme } = useTheme();

    const getGradientColors = () => {
        if (disabled) return [theme.colors.border, theme.colors.border];
        switch (variant) {
            case 'primary':
                return [theme.colors.brand.primary, '#6D28D9'];
            case 'premium':
                return ['#F59E0B', '#D97706']; // Golden accent
            case 'danger':
                return [theme.colors.brand.toxic, '#B91C1C'];
            case 'secondary':
                return [theme.colors.surface, theme.colors.surface];
            default:
                return [theme.colors.brand.primary, '#6D28D9'];
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.colors.textSecondary;
        return variant === 'secondary' ? theme.colors.text : '#FFFFFF';
    };

    const getPadding = () => {
        switch (size) {
            case 'small':
                return { paddingHorizontal: 16, paddingVertical: 8 };
            case 'large':
                return { paddingHorizontal: 36, paddingVertical: 18 };
            default:
                return { paddingHorizontal: 28, paddingVertical: 14 };
        }
    };

    const getTextStyle = () => {
        switch (size) {
            case 'small':
                return theme.typography.bodySmall;
            case 'large':
                return theme.typography.h3;
            default:
                return theme.typography.button;
        }
    };

    const isSecondary = variant === 'secondary';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.button,
                    {
                        borderRadius: theme.borderRadius.lg,
                        ...getPadding(),
                        borderWidth: 1,
                        borderColor: isSecondary ? theme.colors.border : theme.colors.glassBorder,
                        overflow: 'hidden', // PREVENT BACKGROUND BLEEDING
                    },
                    !isSecondary && {
                        ...theme.shadows.glass[theme.isDark ? 'dark' : 'light'],
                    }
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={getTextColor()} />
                ) : (
                    <Text
                        style={[
                            styles.text,
                            getTextStyle(),
                            { color: getTextColor() },
                        ]}
                    >
                        {title}
                    </Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 4,
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
    },
});
