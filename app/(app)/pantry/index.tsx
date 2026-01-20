import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, SlideOutRight } from 'react-native-reanimated';
import api from '../../../src/lib/api';
import { PantryItem } from '../../../src/types';

export default function PantryScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    // 1. Fetch Pantry
    const { data: pantry = [], isLoading, isError, error } = useQuery({
        queryKey: ['pantry'],
        queryFn: async () => {
            const res = await api.get('/pantry');
            return res.data;
        },
    });

    // 2. Remove Mutation
    const deleteMutation = useMutation({
        mutationFn: async (itemId: string) => {
            await api.delete(`/pantry/${itemId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pantry'] });
        },
    });

    // 3. Update Mutation
    const updateMutation = useMutation({
        mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
            await api.put(`/pantry/${itemId}`, { quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pantry'] });
        },
    });

    const handleRemove = (itemId: string) => {
        Alert.alert(
            "Remove Item",
            "Are you sure you want to remove this item from your pantry?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: () => deleteMutation.mutate(itemId)
                }
            ]
        );
    };

    const handleQuantityChange = (item: PantryItem, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemove(item._id);
        } else {
            updateMutation.mutate({ itemId: item._id, quantity: newQuantity });
        }
    };

    const renderItem = ({ item, index }: { item: PantryItem; index: number }) => {
        const ingredient = typeof item.ingredient === 'object' ? item.ingredient : { name: 'Unknown', _id: '', unit: '', image: undefined };

        return (
            <Animated.View
                entering={FadeInDown.delay(index * 50).springify()}
                exiting={SlideOutRight}
                style={styles.card}
            >
                {ingredient.image ? (
                    <Image source={{ uri: ingredient.image }} style={styles.itemImage} />
                ) : (
                    <View style={[styles.itemImage, { backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="image-outline" size={20} color={COLORS.text.light} />
                    </View>
                )}

                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{ingredient.name}</Text>
                    <Text style={styles.itemUnit}>{item.quantity} {item.unit || ingredient.unit || 'units'}</Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={() => handleQuantityChange(item, item.quantity - 1)}
                        style={styles.controlButton}
                    >
                        <Ionicons name="remove" size={16} color={COLORS.text.primary} />
                    </TouchableOpacity>

                    <Text style={styles.quantity}>{item.quantity}</Text>

                    <TouchableOpacity
                        onPress={() => handleQuantityChange(item, item.quantity + 1)}
                        style={styles.controlButton}
                    >
                        <Ionicons name="add" size={16} color={COLORS.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleRemove(item._id)}
                        style={[styles.controlButton, { marginLeft: SPACING.s, backgroundColor: '#fee2e2' }]}
                    >
                        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/pantry/add')}
            >
                <Ionicons name="add" size={24} color={COLORS.card} />
            </TouchableOpacity>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : isError ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>Error loading pantry: {(error as any).message}</Text>
                </View>
            ) : (

                <FlatList
                    data={pantry}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="basket-outline" size={64} color={COLORS.text.light} style={{ marginBottom: SPACING.m }} />
                            <Text style={styles.emptyText}>Your pantry is empty.</Text>
                            <Text style={styles.emptySubtext}>Add items to track what you have!</Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/pantry/add')}
                            >
                                <Text style={styles.emptyButtonText}>Add First Item</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingBottom: SPACING.l,
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
    addButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: SPACING.m,
        paddingBottom: 40,
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
        borderRadius: 12,
        marginRight: SPACING.m,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: FONTS.sizes.body,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    itemUnit: {
        fontSize: FONTS.sizes.small,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    controlButton: {
        width: 32,
        height: 32,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantity: {
        fontSize: FONTS.sizes.body,
        fontWeight: '600',
        minWidth: 24,
        textAlign: 'center',
        color: COLORS.text.primary
    },
    errorText: {
        color: COLORS.error,
        fontSize: FONTS.sizes.body,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: SPACING.xl,
        marginTop: SPACING.xl,
    },
    emptyText: {
        fontSize: FONTS.sizes.h3,
        color: COLORS.text.primary,
        fontWeight: '700',
        marginBottom: SPACING.s,
    },
    emptySubtext: {
        fontSize: FONTS.sizes.body,
        color: COLORS.text.secondary,
        textAlign: 'center',
        marginBottom: SPACING.l,
    },
    emptyButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.m,
        paddingHorizontal: SPACING.xl,
        borderRadius: SPACING.l,
        ...SHADOWS.medium
    },
    emptyButtonText: {
        color: COLORS.card,
        fontWeight: '700',
        fontSize: FONTS.sizes.body
    }
});
