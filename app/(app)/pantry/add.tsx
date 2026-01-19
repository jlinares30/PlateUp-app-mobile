import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import api from "../../../src/lib/api";

// Reuse ingredient interface or import from types if available
interface Ingredient {
    _id: string;
    name: string;
    category?: string;
    calories?: number;
    image?: string;
    unit: string;
}

export default function PantryAddScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch Ingredients
    const {
        data: ingredients = [],
        isLoading,
        isFetching
    } = useQuery({
        queryKey: ['ingredients', debouncedQuery],
        queryFn: async () => {
            // Reuse the ingredients endpoint
            const res = await api.get("/ingredients", {
                params: debouncedQuery.trim() ? { query: debouncedQuery.trim() } : {}
            });
            const data = res.data?.data ?? res.data;
            return Array.isArray(data) ? data : [];
        },
    });

    // Add to Pantry Mutation
    const addMutation = useMutation({
        mutationFn: async (item: Ingredient) => {
            const res = await api.post("/pantry", {
                ingredientId: item._id,
                quantity: 1,
                unit: item.unit
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pantry'] });
            Alert.alert("Success", "Item added to pantry!");
            // Optional: go back or stay to add more
            // router.back(); 
        },
        onError: (error: any) => {
            Alert.alert("Error", error.response?.data?.message || "Failed to add item");
        }
    });

    const renderItem = ({ item }: { item: Ingredient }) => (
        <View style={styles.card}>
            {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
            ) : (
                <View style={[styles.itemImage, { backgroundColor: '#eee' }]} />
            )}
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.detail}>{item.unit} • {item.calories ?? 0} cal</Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => addMutation.mutate(item)}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#2c3e50" />
                </TouchableOpacity>
                <Text style={styles.title}>Add to Pantry</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#bdc3c7" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search ingredients..."
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery("")}>
                        <Ionicons name="close-circle" size={20} color="#bdc3c7" />
                    </TouchableOpacity>
                )}
            </View>

            {isLoading || (isFetching && debouncedQuery) ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#8e44ad" />
                </View>
            ) : (
                <FlatList
                    data={ingredients}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    keyboardShouldPersistTaps="handled"
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 50,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 16,
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2c3e50',
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    itemImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    detail: {
        fontSize: 14,
        color: '#95a5a6',
    },
    addButton: {
        backgroundColor: '#8e44ad',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        marginTop: 50,
        alignItems: 'center',
    },
});
