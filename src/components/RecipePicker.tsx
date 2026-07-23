import { COLORS, useThemeColors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../lib/api';
import { useTranslation } from '../lib/i18n';

interface Recipe {
    _id: string;
    title: string;
    time: string;
    category?: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (recipe: Recipe) => void;
}

type FilterType = 'all' | 'my' | 'favorites';

export default function RecipePicker({ visible, onClose, onSelect }: Props) {
    const { t, language } = useTranslation();
    const { colors } = useThemeColors();
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (visible) {
            setQuery('');
            setFilter('all');
            fetchRecipes('', 'all');
        }
    }, [visible]);

    const fetchRecipes = async (q: string, activeFilter: FilterType) => {
        setLoading(true);
        try {
            let endpoint = '/recipes';
            if (activeFilter === 'my') {
                endpoint = '/recipes/my';
            } else if (activeFilter === 'favorites') {
                endpoint = '/recipes/favorites/all';
            }

            const res = await api.get(endpoint, { params: q ? { query: q } : {} });
            const data = res.data?.data ?? res.data;
            setRecipes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text: string) => {
        setQuery(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchRecipes(text, filter);
        }, 400);
    };

    const changeFilter = (newFilter: FilterType) => {
        setFilter(newFilter);
        fetchRecipes(query, newFilter);
    };

    const renderItem = ({ item }: { item: Recipe }) => (
        <TouchableOpacity style={[styles.item, { borderBottomColor: colors.border }]} onPress={() => { onSelect(item); onClose(); }}>
            <View>
                <Text style={[styles.itemTitle, { color: colors.text.primary }]}>{item.title}</Text>
                <Text style={[styles.itemTime, { color: colors.text.secondary }]}>{item.time} {item.category ? `· ${item.category}` : ''}</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text.primary }]}>{language === 'es' ? 'Seleccionar Receta' : 'Select Recipe'}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={[styles.close, { color: colors.primary }]}>{t('common.cancel')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View style={styles.tabs}>
                    {(['all', 'my', 'favorites'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                { backgroundColor: colors.card },
                                filter === tab && { backgroundColor: colors.primary }
                            ]}
                            onPress={() => changeFilter(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: colors.text.secondary },
                                filter === tab && styles.activeTabText
                            ]}>
                                {tab === 'all' ? (language === 'es' ? 'Todas' : 'All') :
                                    tab === 'my' ? (language === 'es' ? 'Mis Recetas' : 'My Recipes') :
                                        (language === 'es' ? 'Favoritas' : 'Favorites')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Search */}
                <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={18} color={colors.text.light} />
                    <TextInput
                        style={[styles.input, { color: colors.text.primary }]}
                        placeholder={t('recipes.searchTitle')}
                        placeholderTextColor={colors.text.light}
                        value={query}
                        onChangeText={handleSearch}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color={colors.primary} />
                ) : (
                    <FlatList
                        data={recipes}
                        keyExtractor={item => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={[styles.empty, { color: colors.text.secondary }]}>{t('recipes.noRecipesFound')}</Text>}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    title: { fontSize: 18, fontWeight: '700' },
    close: { color: '#2980b9', fontSize: 16 },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 10,
        gap: 10
    },
    tab: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f1f2f6',
    },
    activeTab: {
        backgroundColor: '#2980b9',
    },
    tabText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '600'
    },
    activeTabText: {
        color: '#fff'
    },
    searchBox: {
        flexDirection: 'row',
        backgroundColor: '#f1f2f6',
        marginHorizontal: 16,
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    input: { marginLeft: 8, flex: 1, fontSize: 16 },
    list: { padding: 16 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f2f6',
    },
    itemTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
    itemTime: { fontSize: 13, color: '#95a5a6' },
    empty: { textAlign: 'center', marginTop: 20, color: '#95a5a6' },
});
