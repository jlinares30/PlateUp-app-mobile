import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../lib/api';

interface Recipe {
    _id: string;
    title: string;
    time: string;
}

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (recipe: Recipe) => void;
}

export default function RecipePicker({ visible, onClose, onSelect }: Props) {
    const [query, setQuery] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef<number | null>(null);

    useEffect(() => {
        if (visible) {
            fetchRecipes('');
        }
    }, [visible]);

    const fetchRecipes = async (q: string) => {
        setLoading(true);
        try {
            const res = await api.get('/recipes', { params: q ? { query: q } : {} });
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
            fetchRecipes(text);
        }, 400);
    };

    const renderItem = ({ item }: { item: Recipe }) => (
        <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemTime}>{item.time}</Text>
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

                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#7f8c8d" />
                    <TextInput
                        style={styles.input}
                        placeholder="Buscar recetas..."
                        value={query}
                        onChangeText={handleSearch}
                        autoFocus
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
    searchBox: {
        flexDirection: 'row',
        backgroundColor: '#f1f2f6',
        marginHorizontal: 16,
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
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
    itemTitle: { fontSize: 16, flex: 1, fontWeight: '500' },
    itemTime: { fontSize: 14, color: '#95a5a6', marginRight: 10 },
    empty: { textAlign: 'center', marginTop: 20, color: '#95a5a6' },
});
