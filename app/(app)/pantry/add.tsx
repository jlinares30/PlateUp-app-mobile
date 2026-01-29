import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Toast from 'react-native-toast-message';
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


        // ...

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pantry'] });
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: "Item added to pantry!"
            });
        },
        onError: (error: any) => {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || "Failed to add item"
            });
        }
    });

    const renderItem = ({ item, index }: { item: Ingredient; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => addMutation.mutate(item)}
            >
                {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Ionicons name="nutrition-outline" size={24} color={COLORS.text.light} />
                    </View>
                )}
                <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.detail}>{item.unit} • {item.category || 'Uncategorized'}</Text>
                </View>
                <View
                    style={styles.addButton}
                >
                    <Ionicons name="add" size={20} color={COLORS.card} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Add to Pantry</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.text.light} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search ingredients..."
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    placeholderTextColor={COLORS.text.light}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery("")}>
                        <Ionicons name="close-circle" size={20} color={COLORS.text.light} />
                    </TouchableOpacity>
                )}
            </View>

            {isLoading || (isFetching && debouncedQuery) ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={ingredients}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !isLoading ? (
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No ingredients found.</Text>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.xl * 1.5,
        paddingBottom: SPACING.m,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.small,
        zIndex: 10,
    },
    backButton: {
        padding: SPACING.xs,
    },
    title: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        margin: SPACING.m,
        paddingHorizontal: SPACING.m,
        height: 48,
        borderRadius: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    searchIcon: {
        marginRight: SPACING.s,
    },
    input: {
        flex: 1,
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
    },
    list: {
        padding: SPACING.m,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
    },
    itemImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: SPACING.m,
    },
    placeholderImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: SPACING.m,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: FONTS.sizes.body,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    detail: {
        fontSize: FONTS.sizes.small,
        color: COLORS.text.light,
        marginTop: 2,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    center: {
        marginTop: SPACING.xl * 2,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: FONTS.sizes.body,
        color: COLORS.text.secondary,
    }
});
