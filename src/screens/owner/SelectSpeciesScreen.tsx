import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { SearchBar } from '../../components/SearchBar';
import { Chip } from '../../components/Chip';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SpeciesRepository } from '../../database/repository';
import { Species, SizeCategory } from '../../types';
import { getSpeciesImage } from '../../utils/imageMap';

const SelectSpeciesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [allSpecies, setAllSpecies] = useState<Species[]>([]);
    const [filteredSpecies, setFilteredSpecies] = useState<Species[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);

    useEffect(() => {
        loadSpecies();
    }, []);

    useEffect(() => {
        filterSpecies();
    }, [searchQuery, activeFilter, allSpecies]);

    const loadSpecies = async () => {
        const species = await SpeciesRepository.getAll();
        console.log('[DEBUG] First 10 species from repo:', species.slice(0, 10).map(s => `${s.commonName}: ${s.imageAsset}`));
        setAllSpecies(species);
        setFilteredSpecies(species);
    };

    const filterSpecies = async () => {
        let results = allSpecies;

        if (searchQuery) {
            results = await SpeciesRepository.search(searchQuery);
        } else if (activeFilter !== 'All') {
            if (activeFilter === 'Popular') {
                results = await SpeciesRepository.getPopular(15);
            } else if (['Small', 'Medium', 'Large'].includes(activeFilter)) {
                results = await SpeciesRepository.filterBySize(activeFilter as SizeCategory);
            } else if (activeFilter === 'Sensitive') {
                results = await SpeciesRepository.filterBySensitivity('Sensitive');
            }
        }

        setFilteredSpecies(results);
    };

    const handleSelectSpecies = () => {
        if (selectedSpecies) {
            navigation.navigate('CreateProfile', { species: selectedSpecies });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search species..."
                />

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filters}
                    contentContainerStyle={styles.filtersContent}
                >
                    {['All', 'Popular', 'Small', 'Medium', 'Large', 'Sensitive'].map((filter) => (
                        <Chip
                            key={filter}
                            label={filter}
                            active={activeFilter === filter}
                            onPress={() => setActiveFilter(filter)}
                            style={{ marginRight: 8 }}
                        />
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.list}>
                {filteredSpecies.map((species) => (
                    <TouchableOpacity
                        key={species.id}
                        onPress={() => setSelectedSpecies(species)}
                    >
                        <Card style={[
                            styles.speciesCard,
                            selectedSpecies?.id === species.id && {
                                borderColor: theme.colors.brand.primary,
                                borderWidth: 3,
                            }
                        ]}>
                            <Image
                                source={getSpeciesImage(species.imageAsset)}
                                style={styles.speciesImage}
                                resizeMode="cover"
                            />
                            <View style={styles.speciesInfo}>
                                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>
                                    {species.commonName}
                                </Text>
                                <Text style={[theme.typography.bodySmall, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>
                                    {species.scientificName}
                                </Text>
                                <View style={styles.tags}>
                                    <View style={[styles.tag, { backgroundColor: theme.colors.brand.primary + '20' }]}>
                                        <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, fontWeight: '700' }]}>
                                            {species.sizeCategory}
                                        </Text>
                                    </View>
                                    {species.sensitivityTag === 'Sensitive' && (
                                        <View style={[styles.tag, { backgroundColor: theme.colors.brand.coral }]}>
                                            <Text style={[theme.typography.caption, { color: '#FFFFFF' }]}>
                                                Sensitive
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {selectedSpecies && (
                <View style={[styles.footer, {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.glassBorder,
                    paddingBottom: Math.max(insets.bottom, 24)
                }]}>
                    <Button
                        title={`Select ${selectedSpecies.commonName}`}
                        onPress={handleSelectSpecies}
                        variant="primary"
                    />
                </View>
            )}
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
    },
    speciesCard: {
        flexDirection: 'row',
        marginBottom: 16,
        padding: 12,
    },
    speciesImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 12,
    },
    speciesInfo: {
        flex: 1,
    },
    rankBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    tags: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    tag: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
    },
});

export default SelectSpeciesScreen;
