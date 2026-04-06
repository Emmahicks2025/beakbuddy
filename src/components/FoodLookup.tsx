import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FoodVerdictBadge } from './FoodVerdictBadge';
import { FOOD_DATABASE } from '../data/foodSafety';
import { FoodItem } from '../types';

interface FoodLookupProps {
    onSelect?: (item: FoodItem) => void;
    onAddToShoppingList?: (item: FoodItem) => void;
}

export const FoodLookup: React.FC<FoodLookupProps> = ({ onSelect, onAddToShoppingList }) => {
    const { theme } = useTheme();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>([]);

    const handleSearch = (text: string) => {
        setQuery(text);
        if (text.length < 2) {
            setResults([]);
            return;
        }

        const lowerText = text.toLowerCase();
        const filtered = FOOD_DATABASE.filter(item =>
            item.name.toLowerCase().includes(lowerText) ||
            item.aliases.toLowerCase().includes(lowerText)
        );
        setResults(filtered);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={{ marginRight: 8 }}>🔍</Text>
                <TextInput
                    style={[styles.input, theme.typography.body, { color: theme.colors.text }]}
                    placeholder="Can my parrot eat... (e.g. Apple)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={query}
                    onChangeText={handleSearch}
                />
            </View>

            {results.length > 0 && (
                <View style={[styles.resultsList, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    {results.map(item => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
                            onPress={() => onSelect && onSelect(item)}
                            disabled={!onSelect}
                        >
                            <View style={styles.resultHeader}>
                                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                                    {item.name}
                                </Text>
                                <FoodVerdictBadge verdict={item.verdict} confidence={item.confidence} />
                                {onSelect && item.verdict !== 'TOXIC' && (
                                    <TouchableOpacity onPress={() => onSelect(item)} style={{ marginLeft: 8 }}>
                                        <Text style={[theme.typography.caption, { color: theme.colors.brand.primary }]}>
                                            + Log Meal
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {onAddToShoppingList && (
                                    <TouchableOpacity
                                        onPress={() => onAddToShoppingList(item)}
                                        style={{ marginLeft: 8 }}
                                    >
                                        <Text style={[theme.typography.caption, { color: theme.colors.brand.primary }]}>
                                            + List
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            {
                                item.notes ? (
                                    <Text style={[theme.typography.bodySmall, { color: theme.colors.text, marginTop: 4 }]}>
                                        {item.notes}
                                    </Text>
                                ) : null
                            }
                            {
                                item.servingTips ? (
                                    <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4, fontStyle: 'italic' }]}>
                                        💡 {item.servingTips}
                                    </Text>
                                ) : null
                            }
                        </TouchableOpacity>
                    ))}
                </View>
            )
            }
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    input: {
        flex: 1,
    },
    resultsList: {
        marginTop: 8,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    resultItem: {
        padding: 12,
        borderBottomWidth: 1,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
