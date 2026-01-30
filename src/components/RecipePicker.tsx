import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../lib/api';

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
        <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
            <View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemTime}>{item.time || 'N/A'}</Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color="#2980b9" />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Seleccionar Receta</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.close}>Cerrar</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, filter === 'all' && styles.activeTab]}
                        onPress={() => changeFilter('all')}
                    >
                        <Text style={[styles.tabText, filter === 'all' && styles.activeTabText]}>Explorar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, filter === 'favorites' && styles.activeTab]}
                        onPress={() => changeFilter('favorites')}
                    >
                        <Text style={[styles.tabText, filter === 'favorites' && styles.activeTabText]}>Favoritos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, filter === 'my' && styles.activeTab]}
                        onPress={() => changeFilter('my')}
                    >
                        <Text style={[styles.tabText, filter === 'my' && styles.activeTabText]}>Mis Recetas</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#7f8c8d" />
                    <TextInput
                        style={styles.input}
                        placeholder="Buscar recetas..."
                        value={query}
                        onChangeText={handleSearch}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={recipes}
                        keyExtractor={item => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.empty}>No se encontraron recetas</Text>}
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
