import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SearchBar } from '../../components/SearchBar';
import { Card } from '../../components/Card';
import { FoodVerdictBadge } from '../../components/FoodVerdictBadge';
import { FoodRepository, ShoppingListRepository } from '../../database/repository';
import { WebProfileRepository } from '../../database/webRepository';
import { FoodItem } from '../../types';
import { AlertService } from '../../services/AlertService';
import { sendChatToAI } from '../../services/aiChat';
import { useProfileContext } from '../../context/ProfileContext';
import { MedicalDisclaimerLine } from '../../components/MedicalDisclaimerLine';

const SearchTab: React.FC = () => {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
    const [allSafeFoods, setAllSafeFoods] = useState<FoodItem[]>([]);
    const [displayedFoods, setDisplayedFoods] = useState<FoodItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<FoodItem | null>(null);
    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        loadRecentSearches();
    }, []);

    useEffect(() => {
        if (searchQuery.length > 0) {
            setAiResult(null);
            performSearch();
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const loadRecentSearches = async () => {
        try {
            const safe = await FoodRepository.getByVerdict('SAFE');
            setAllSafeFoods(safe);
            // Load first page
            setDisplayedFoods(safe.slice(0, ITEMS_PER_PAGE));
            setCurrentPage(1);
        } catch (error) {
            console.error('Error loading recent searches:', error);
            setAllSafeFoods([]);
            setDisplayedFoods([]);
        } finally {
            setIsLoading(false);
        }
    };

    const loadMoreFoods = () => {
        if (isLoadingMore || searchQuery.length > 0) return;

        const nextPage = currentPage + 1;
        const startIndex = currentPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const moreFoods = allSafeFoods.slice(startIndex, endIndex);

        if (moreFoods.length > 0) {
            setIsLoadingMore(true);
            // Simulate slight delay for smooth UX
            setTimeout(() => {
                setDisplayedFoods(prev => [...prev, ...moreFoods]);
                setCurrentPage(nextPage);
                setIsLoadingMore(false);
            }, 300);
        }
    };

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 100;

        // Check if user is near bottom of scroll
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMoreFoods();
        }
    };

    const performSearch = async () => {
        try {
            const results = await FoodRepository.search(searchQuery);
            setSearchResults(results);
        } catch (error) {
            console.error('Error performing search:', error);
            setSearchResults([]);
        }
    };

    const { activeProfile } = useProfileContext();

    const handleAddToList = async (item: FoodItem) => {
        if (!activeProfile) {
            AlertService.alert('Error', 'No profile found.');
            return;
        }

        await ShoppingListRepository.create({
            profileId: activeProfile.id,
            text: item.name,
            category: 'food'
        });
        AlertService.alert('Added', `${item.name} added to your shopping list.`);
    };

    const validateFoodItem = (food: FoodItem): boolean => {
        return !!(
            food &&
            food.name &&
            food.verdict &&
            (food.verdict === 'SAFE' || food.verdict === 'TOXIC' || food.verdict === 'UNKNOWN') &&
            typeof food.confidence === 'number'
        );
    };

    const handleAIAnalysis = async () => {
        if (!searchQuery.trim()) return;

        setIsAnalyzing(true);
        setAiResult(null);

        try {
            const prompt = `Analyze the food item '${searchQuery}' for a parrot. 
            Return a JSON object with strictly this structure:
            {
                "name": "${searchQuery}",
                "verdict": "SAFE" | "TOXIC" | "UNKNOWN",
                "confidence": number (0-1),
                "notes": "brief explanation",
                "servingTips": "how to serve",
                "symptoms": "if toxic, what happens",
                "sourceNote": "AI Analysis"
            }
            Do not include markdown formatting like \`\`\`json. Return raw JSON only.`;

            // Mock context for the API
            const context: any = {
                profile: null,
                plans: [],
                sessions: [],
                diet: null,
                tasks: []
            };

            const response = await sendChatToAI([
                { id: '1', role: 'user', text: prompt, timestamp: Date.now() }
            ], context);

            // Clean response if it contains markdown
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonStr);

            // Validate result
            if (result.verdict) {
                setAiResult(result);
            } else {
                throw new Error('Invalid AI response');
            }

        } catch (error) {
            console.error('AI Analysis failed:', error);
            AlertService.alert('Analysis Failed', 'Could not analyze this food item. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderFoodItem = (food: FoodItem) => (
        <Card key={food.id || food.name} style={styles.foodCard}>
            <View style={styles.foodHeader}>
                <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>
                    {food.name}
                </Text>
                <View style={{ alignItems: 'flex-end' }}>
                    <FoodVerdictBadge verdict={food.verdict} confidence={food.confidence} />
                    {food.verdict !== 'TOXIC' && (
                        <TouchableOpacity onPress={() => handleAddToList(food)} style={{ marginTop: 8 }}>
                            <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, fontWeight: '600' }]}>
                                + Add to List
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {!!food.notes && (
                <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>
                    {food.notes}
                </Text>
            )}

            {!!food.symptoms && food.verdict === 'TOXIC' && (
                <View style={[styles.warningBox, { backgroundColor: theme.colors.brand.toxic + '20', borderColor: theme.colors.brand.toxic }]}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.toxic, fontWeight: '600' }]}>
                        ⚠️ Symptoms: {food.symptoms}
                    </Text>
                </View>
            )}

            {!!food.servingTips && food.verdict === 'SAFE' && (
                <View style={[styles.tipsBox, { backgroundColor: theme.colors.brand.safe + '20', borderColor: theme.colors.brand.safe }]}>
                    <Text style={[theme.typography.bodySmall, { color: theme.colors.brand.safe }]}>
                        💡 {food.servingTips}
                    </Text>
                </View>
            )}
            {!!food.sourceNote && (
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8, fontStyle: 'italic' }]}>
                    Source: {food.sourceNote}
                </Text>
            )}
            <MedicalDisclaimerLine style={{ marginTop: 12 }} />
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.searchContainer}>
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="🔍 Search for any food item..."
                />
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>Loading...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.results}
                    onScroll={handleScroll}
                    scrollEventThrottle={400}
                >
                    {searchResults.length > 0 ? (
                        <>
                            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                                Search Results ({searchResults.length})
                            </Text>
                            {searchResults.filter(validateFoodItem).map(renderFoodItem)}
                        </>
                    ) : searchQuery.length === 0 ? (
                        <>
                            <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: 12 }]}>
                                Safe Foods for Parrots
                            </Text>
                            {displayedFoods.filter(validateFoodItem).map(renderFoodItem)}
                            {isLoadingMore && (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                                        Loading more foods...
                                    </Text>
                                </View>
                            )}
                            {displayedFoods.length >= allSafeFoods.length && displayedFoods.length > 0 && (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                                        All {allSafeFoods.length} safe foods loaded ✓
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <View>
                            {/* No Local Results */}
                            {!aiResult && !isAnalyzing && (
                                <Card style={styles.infoCard}>
                                    <Text style={[theme.typography.h3, { textAlign: 'center', marginBottom: 8 }]}>🤔</Text>
                                    <Text style={[theme.typography.body, { color: theme.colors.text, textAlign: 'center', marginBottom: 16 }]}>
                                        Not found in our database.
                                    </Text>
                                    <TouchableOpacity
                                        style={[
                                            { backgroundColor: theme.colors.brand.primary, padding: 12, borderRadius: 8, alignItems: 'center' }
                                        ]}
                                        onPress={handleAIAnalysis}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>✨ Analyze "{searchQuery}" with AI</Text>
                                    </TouchableOpacity>
                                </Card>
                            )}

                            {/* Loading State */}
                            {isAnalyzing && (
                                <Card style={styles.infoCard}>
                                    <Text style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                                        ✨ Analyzing nutrition data...
                                    </Text>
                                </Card>
                            )}

                            {/* AI Result */}
                            {aiResult && (
                                <View>
                                    <Text style={[theme.typography.caption, { color: theme.colors.brand.primary, marginBottom: 8, textAlign: 'center' }]}>
                                        ✨ AI Analysis Result
                                    </Text>
                                    {renderFoodItem(aiResult)}
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        padding: 16,
    },
    results: {
        flex: 1,
        padding: 16,
        paddingTop: 0,
    },
    foodCard: {
        marginBottom: 16,
    },
    foodHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    warningBox: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    tipsBox: {
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    infoCard: {
        padding: 24,
        alignItems: 'center',
    },
});

export default SearchTab;
