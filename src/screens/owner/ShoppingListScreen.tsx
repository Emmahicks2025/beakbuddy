import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useProfileContext } from '../../context/ProfileContext';
import { ShoppingListRepository } from '../../database/repository';
import { ShoppingListItem } from '../../types';

const ShoppingListScreen: React.FC = () => {
    const { theme } = useTheme();
    const { activeProfile } = useProfileContext();
    const [items, setItems] = useState<ShoppingListItem[]>([]);
    const [newItemName, setNewItemName] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isLoading, setIsLoading] = useState(true);

    // Reload items when screen gains focus (e.g., when switching tabs)
    useFocusEffect(
        React.useCallback(() => {
            loadItems(true);
        }, [activeProfile])
    );

    const loadItems = async (isInitialLog = false) => {
        if (!activeProfile) return;
        if (isInitialLog) setIsLoading(true);
        try {
            const saved = await ShoppingListRepository.getByProfile(activeProfile.id);
            setItems(saved);
        } catch (e) {
            console.error('Failed to load shopping list', e);
        } finally {
            if (isInitialLog) setIsLoading(false);
        }
    };

    const addItem = async () => {
        if (!newItemName.trim() || !activeProfile) return;

        const uiCategory = activeCategory === 'All' ? 'Food' : activeCategory;
        const categoryMap: Record<string, "food" | "toy" | "supply" | "other"> = {
            'Food': 'food',
            'Toys': 'toy',
            'Health': 'supply'
        };
        const category = categoryMap[uiCategory] || 'other';

        // Optimistic UI update - add item immediately to state
        const tempId = `temp_${Date.now()}`;
        const newItem: ShoppingListItem = {
            id: tempId,
            profileId: activeProfile.id,
            text: newItemName.trim(),
            category: category,
            isChecked: false,
            createdAt: Date.now()
        };

        setItems(prev => [newItem, ...prev]);
        setNewItemName('');

        // Then persist to database and refresh
        try {
            await ShoppingListRepository.create({
                profileId: activeProfile.id,
                text: newItem.text,
                category: category
            });
            await loadItems(); // Refresh to get real ID from database
        } catch (error) {
            console.error('Failed to add item:', error);
            // Rollback optimistic update on error
            setItems(prev => prev.filter(item => item.id !== tempId));
        }
    };

    const toggleItem = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item
        ));
        await ShoppingListRepository.toggleCheck(id, !currentStatus);
        await loadItems();
    };

    const deleteItem = async (id: string) => {
        // Optimistic update
        setItems(prev => prev.filter(item => item.id !== id));
        await ShoppingListRepository.delete(id);
        await loadItems();
    };

    const categories = ['All', 'Food', 'Toys', 'Health'];

    // Map UI categories to database categories for filtering
    const getCategoryFilter = (uiCategory: string): string | null => {
        const categoryMap: Record<string, string> = {
            'Food': 'food',
            'Toys': 'toy',
            'Health': 'supply'
        };
        return categoryMap[uiCategory] || null;
    };

    const filteredItems = activeCategory === 'All'
        ? items
        : items.filter(i => i.category === getCategoryFilter(activeCategory));

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.addSection}>
                <TextInput
                    style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
                    placeholder="Add to list..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={newItemName}
                    onChangeText={setNewItemName}
                />
                <Button title="Add" onPress={addItem} style={styles.addButton} />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
                <View style={styles.tabContainer}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setActiveCategory(cat)}
                            style={[
                                styles.tab,
                                activeCategory === cat && { backgroundColor: theme.colors.brand.primary + '20', borderColor: theme.colors.brand.primary }
                            ]}
                        >
                            <Text style={[
                                theme.typography.caption,
                                { color: activeCategory === cat ? theme.colors.brand.primary : theme.colors.textSecondary, fontWeight: '700' }
                            ]}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <ScrollView style={styles.list}>
                {!activeProfile ? (
                    <Text style={[theme.typography.body, { textAlign: 'center', marginTop: 40, color: theme.colors.textSecondary }]}>
                        Select a parrot to see their list
                    </Text>
                ) : filteredItems.length === 0 ? (
                    <Text style={[theme.typography.body, { textAlign: 'center', marginTop: 40, color: theme.colors.textSecondary }]}>
                        {isLoading ? 'Loading...' : 'Your list is empty'}
                    </Text>
                ) : filteredItems.map(item => (
                    <Card key={item.id} style={styles.itemCard}>
                        <TouchableOpacity
                            style={styles.checkRow}
                            onPress={() => toggleItem(item.id, item.isChecked)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.checkbox,
                                {
                                    backgroundColor: item.isChecked ? theme.colors.brand.primary : 'transparent',
                                    borderColor: item.isChecked ? theme.colors.brand.primary : theme.colors.border
                                }
                            ]}>
                                {!!item.isChecked && <Text style={{ fontSize: 12, color: '#FFF' }}>✓</Text>}
                            </View>
                            <Text style={[
                                theme.typography.body,
                                {
                                    color: item.isChecked ? theme.colors.textSecondary : theme.colors.text,
                                    textDecorationLine: item.isChecked ? 'line-through' : 'none',
                                    flex: 1
                                }
                            ]}>
                                {item.text}
                            </Text>
                            <TouchableOpacity onPress={() => deleteItem(item.id)} style={{ padding: 8 }}>
                                <Text style={{ fontSize: 18 }}>🗑️</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </Card>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    addSection: {
        padding: 16,
        flexDirection: 'row',
        gap: 12,
    },
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    addButton: {
        width: 80,
    },
    tabScroll: {
        maxHeight: 50,
        marginBottom: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    list: {
        padding: 16,
    },
    itemCard: {
        marginBottom: 10,
        padding: 4,
        borderRadius: 16,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    }
});

export default ShoppingListScreen;
