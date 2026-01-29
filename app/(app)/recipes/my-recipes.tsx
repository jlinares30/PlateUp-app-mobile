import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { normalizeTags } from "@/src/lib/utils";
import { useAuthStore } from "@/src/store/useAuth";
import { Recipe } from "@/src/types";
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';

type Tab = 'my-recipes' | 'favorites';

export default function MyRecipesScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('my-recipes');
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    // Query for My Recipes
    const {
        data: myRecipes = [],
        isLoading: loadingMy,
        refetch: refetchMy,
        isRefetching: refetchingMy
    } = useQuery({
        queryKey: ['recipes', 'my', user?._id], // Added user ID to key
        queryFn: async () => {
            if (!user) return [];
            const res = await api.get("/recipes/my");
            // Handle array wrapped in data or direct array
            return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        },
        enabled: !!user
    });

    // Query for Favorites
    const {
        data: favorites = [],
        isLoading: loadingFavorites,
        refetch: refetchFavorites,
        isRefetching: refetchingFavorites
    } = useQuery({
        queryKey: ['recipes', 'favorites'],
        queryFn: async () => {
            const res = await api.get("/recipes/favorites/all");
            return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        },
        enabled: !!user
    });

    const isLoading = loadingMy || loadingFavorites;
    const isRefreshing = refetchingMy || refetchingFavorites;

    const onRefresh = () => {
        if (activeTab === 'my-recipes') refetchMy();
        else refetchFavorites();
    };

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/recipes/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes', 'my'] });
            queryClient.invalidateQueries({ queryKey: ['recipes', 'favorites'] }); // Might affect favorites too
        },
        onError: (error: any) => {
            alert(error?.response?.data?.message || "Error deleting recipe");
        }
    });

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Recipe",
            "Are you sure you want to delete this recipe?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(id)
                }
            ]
        );
    };

    const renderItem = ({ item, index }: { item: Recipe; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.9}
                onPress={() => router.push(`/recipes/${item._id}`)}
            >
                <View style={styles.cardContent}>
                    <View style={styles.row}>
                        {(item.image) && (
                            <Image source={{ uri: item.image }} style={styles.recipeImage} />
                        )}
                        <View style={[styles.infoContainer, (!item.image) && { marginLeft: 0 }]}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <View style={styles.metaRow}>
                                <View style={styles.tag}>
                                    <Ionicons name="time-outline" size={12} color={COLORS.text.secondary} />
                                    <Text style={styles.tagText}>{item.time}</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{item.category}</Text>
                                </View>
                            </View>
                            {/* Tags Preview */}
                            {item.tags && item.tags.length > 0 && (
                                <View style={styles.tagsRow}>
                                    {normalizeTags(item.tags).slice(0, 2).map((tag, idx) => (
                                        <Text key={idx} style={styles.tagsPreviewText}>#{tag}</Text>
                                    ))}
                                </View>
                            )}
                        </View>
                        {activeTab === 'my-recipes' && (
                            <TouchableOpacity
                                style={{ padding: 8 }}
                                onPress={() => handleDelete(item._id)}
                            >
                                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                            </TouchableOpacity>
                        )}
                        <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const renderContent = () => {
        if (isLoading && !isRefreshing && !myRecipes.length && !favorites.length) {
            return (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            );
        }

        const data = activeTab === 'my-recipes' ? myRecipes : favorites;

        return (
            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name={activeTab === 'my-recipes' ? "restaurant-outline" : "heart-outline"} size={64} color={COLORS.text.light} style={{ marginBottom: SPACING.m }} />
                        <Text style={styles.emptyText}>
                            {activeTab === 'my-recipes'
                                ? "You haven't created any recipes yet."
                                : "No favorite recipes found."}
                        </Text>
                    </View>
                }
            />
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Collections</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'my-recipes' && styles.activeTab]}
                        onPress={() => setActiveTab('my-recipes')}
                    >
                        <Text style={[styles.tabText, activeTab === 'my-recipes' && styles.activeTabText]}>My Recipes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
                        onPress={() => setActiveTab('favorites')}
                    >
                        <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favorites</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flex: 1 }}>
                    {renderContent()}
                </View>

                {/* FAB for creating new recipe (only on My Recipes tab) */}
                {activeTab === 'my-recipes' && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => router.push("/recipes/create")}
                    >
                        <Ionicons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
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
        paddingHorizontal: SPACING.m,
        paddingTop: SPACING.s,
        paddingBottom: SPACING.m,
        backgroundColor: COLORS.card,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        ...SHADOWS.small,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.text.primary,
    },
    backButton: {
        padding: SPACING.xs
    },
    content: {
        flex: 1,
        padding: SPACING.m,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: SPACING.l,
        padding: 4,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.s,
        borderRadius: SPACING.m,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: COLORS.primary,
    },
    tabText: {
        fontWeight: '600',
        color: COLORS.text.secondary,
        fontSize: FONTS.sizes.body,
    },
    activeTabText: {
        color: COLORS.card,
        fontWeight: '700',
    },
    listContainer: {
        paddingBottom: 80
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        marginBottom: SPACING.m,
        ...SHADOWS.small,
        overflow: 'hidden'
    },
    cardContent: {
        padding: SPACING.s,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recipeImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: SPACING.m
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center'
    },
    cardTitle: {
        fontSize: FONTS.sizes.h3,
        fontWeight: '700',
        color: COLORS.text.primary,
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: COLORS.text.secondary,
        marginLeft: 4,
        fontWeight: '500'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 40,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: "center",
        color: COLORS.text.secondary,
        fontSize: FONTS.sizes.body,
        lineHeight: 24,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.m,
        right: SPACING.m,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    tagsRow: {
        flexDirection: 'row',
        marginTop: 6,
        gap: 6,
    },
    tagsPreviewText: {
        fontSize: 9,
        color: COLORS.primary,
        backgroundColor: COLORS.primary + '10',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});
