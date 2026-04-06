import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ChipProps {
    label: string;
    active?: boolean;
    onPress: () => void;
    style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
    label,
    active = false,
    onPress,
    style,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.chip,
                {
                    backgroundColor: active ? theme.colors.brand.primary : theme.colors.surface,
                    borderRadius: theme.borderRadius.pill,
                    borderWidth: 1,
                    borderColor: active ? theme.colors.brand.primary : theme.colors.glassBorder,
                    minHeight: 36, // Slimmer chips
                },
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text
                style={[
                    theme.typography.bodySmall,
                    {
                        color: active ? '#FFFFFF' : theme.colors.text,
                        fontWeight: active ? '600' : '400',
                    },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
