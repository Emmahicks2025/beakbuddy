import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SearchBar } from '../../components/SearchBar';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { FoodVerdictBadge } from '../../components/FoodVerdictBadge';
import { FoodRepository } from '../../database/repository';
import { FoodItem, FoodVerdict } from '../../types';

const ListsTab: React.FC = () => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FoodVerdict | 'ALL'>('ALL');
    const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
    const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);

    useEffect(() => {
        loadFoods();
    }, []);

    useEffect(() => {
        filterFoods();
    }, [searchQuery, activeFilter, allFoods]);

    const loadFoods = async () => {
        const foods = await FoodRepository.getAll();
        setAllFoods(foods);
        setFilteredFoods(foods);
    };

    const filterFoods = async () => {
        let results = allFoods;

        if (searchQuery) {
            results = await FoodRepository.search(searchQuery);
        } else if (activeFilter !== 'ALL') {
            results = await FoodRepository.getByVerdict(activeFilter as FoodVerdict);
        }

        setFilteredFoods(results);
    };

    const getCounts = () => {
        const safe = allFoods.filter(f => f.verdict === 'SAFE').length;
        const toxic = allFoods.filter(f => f.verdict === 'TOXIC').length;
        const unknown = allFoods.filter(f => f.verdict === 'UNKNOWN').length;
        return { safe, toxic, unknown };
    };

    const counts = getCounts();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search foods..."
                />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filters}
                    contentContainerStyle={styles.filtersContent}
                >
                    <Chip
                        label={`All (${allFoods.length})`}
                        active={activeFilter === 'ALL'}
                        onPress={() => setActiveFilter('ALL')}
                        style={{ marginRight: 8 }}
                    />
                    <Chip
                        label={`Safe (${counts.safe})`}
                        active={activeFilter === 'SAFE'}
                        onPress={() => setActiveFilter('SAFE')}
                        style={{ marginRight: 8 }}
                    />
                    <Chip
                        label={`Toxic (${counts.toxic})`}
                        active={activeFilter === 'TOXIC'}
                        onPress={() => setActiveFilter('TOXIC')}
                        style={{ marginRight: 8 }}
                    />
                    <Chip
                        label={`Unknown (${counts.unknown})`}
                        active={activeFilter === 'UNKNOWN'}
                        onPress={() => setActiveFilter('UNKNOWN')}
                        style={{ marginRight: 8 }}
                    />
                </ScrollView>
            </View>

            <ScrollView style={styles.list}>
                {filteredFoods.map((food) => (
                    <Card key={food.id} style={styles.foodCard}>
                        <View style={styles.foodHeader}>
                            <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>
                                {food.name}
                            </Text>
                            <FoodVerdictBadge verdict={food.verdict} confidence={food.confidence} />
                        </View>

                        {!!food.notes && (
                            <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 8 }]} numberOfLines={2}>
                                {food.notes}
                            </Text>
                        )}
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
    header: {
        padding: 16,
    },
    filters: {
        marginTop: 12,
    },
    filtersContent: {
        paddingRight: 16,
    },
    list: {
        flex: 1,
        padding: 16,
        paddingTop: 0,
    },
    foodCard: {
        marginBottom: 12,
        padding: 12,
    },
    foodHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
});

export default ListsTab;
