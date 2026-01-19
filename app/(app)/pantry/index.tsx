import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    const renderItem = ({ item }: { item: PantryItem }) => {
        const ingredient = typeof item.ingredient === 'object' ? item.ingredient : { name: 'Unknown', _id: '', unit: '', image: undefined };

        return (
            <View style={styles.card}>
                {ingredient.image && (
                    <Image source={{ uri: ingredient.image }} style={styles.itemImage} />
                )}
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{ingredient.name}</Text>
                    <Text style={styles.itemUnit}>{item.quantity} {item.unit || ingredient.unit}</Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        onPress={() => handleQuantityChange(item, item.quantity - 1)}
                        style={styles.button}
                    >
                        <Ionicons name="remove" size={20} color="#e74c3c" />
                    </TouchableOpacity>

                    <Text style={styles.quantity}>{item.quantity}</Text>

                    <TouchableOpacity
                        onPress={() => handleQuantityChange(item, item.quantity + 1)}
                        style={styles.button}
                    >
                        <Ionicons name="add" size={20} color="#27ae60" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleRemove(item._id)}
                        style={[styles.button, styles.deleteButton]}
                    >
                        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>

                <Text style={styles.title}>My Pantry</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push('/pantry/add')}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#8e44ad" />
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
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Your pantry is empty.</Text>
                            <Text style={styles.emptySubtext}>Add items to track what you have!</Text>
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    addButton: {
        backgroundColor: '#8e44ad',
        padding: 8,
        borderRadius: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
        backgroundColor: '#eee',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
    },
    itemUnit: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    button: {
        padding: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    deleteButton: {
        marginLeft: 8,
    },
    quantity: {
        fontSize: 16,
        fontWeight: '600',
        minWidth: 20,
        textAlign: 'center',
    },
    errorText: {
        color: '#e74c3c',
        fontSize: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: '#2c3e50',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#7f8c8d',
    },
});
