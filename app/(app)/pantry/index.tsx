import ConfirmModal, { ModalAction } from '@/src/components/ConfirmModal';
import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../../src/lib/api';
import { PantryItem } from '../../../src/types';

import { useTranslation } from "@/src/lib/i18n";

const PantryItemRow = React.memo(({
    item,
    onStockChange,
    onRemove,
    getStockColor,
    t
}: {
    item: PantryItem;
    onStockChange: (itemId: string, newLevel: 'FULL' | 'MEDIUM' | 'LOW') => void;
    onRemove: (itemId: string) => void;
    getStockColor: (level?: string) => string;
    t: any;
}) => {
    const { colors } = useThemeColors();
    const ingredient = (item.ingredient && typeof item.ingredient === 'object') ? item.ingredient : { name: 'Unknown', _id: '', unit: '', image: undefined };
    const [localLevel, setLocalLevel] = React.useState<'FULL' | 'MEDIUM' | 'LOW' | null>(null);

    React.useEffect(() => {
        setLocalLevel(null);
    }, [item.stockLevel]);

    const currentLevel = localLevel !== null ? localLevel : (item.stockLevel || 'FULL');

    const handleSelectLevel = (level: 'FULL' | 'MEDIUM' | 'LOW') => {
        setLocalLevel(level); // 0ms instant visual state update!
        onStockChange(item._id, level);
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
            {ingredient.image ? (
                <Image source={{ uri: ingredient.image }} style={styles.itemImage} />
            ) : (
                <View style={[styles.itemImage, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="image-outline" size={20} color={colors.text.light} />
                </View>
            )}

            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text.primary }]}>{ingredient.name}</Text>
                <Text style={[styles.itemUnit, { color: getStockColor(currentLevel), fontWeight: '600' }]}>
                    {currentLevel === 'FULL' ? t('pantry.stockFull') : currentLevel === 'MEDIUM' ? t('pantry.stockMedium') : t('pantry.stockLow')}
                </Text>
            </View>

            <View style={styles.controls}>
                {(['FULL', 'MEDIUM', 'LOW'] as const).map((level) => {
                    const letter = level === 'FULL'
                        ? (t('pantry.stockFull').charAt(0))
                        : level === 'MEDIUM'
                            ? (t('pantry.stockMedium').charAt(0))
                            : (t('pantry.stockLow').charAt(0));
                    return (
                        <TouchableOpacity
                            key={level}
                            delayPressIn={0}
                            activeOpacity={0.7}
                            onPress={() => handleSelectLevel(level)}
                            style={[
                                styles.levelButton,
                                { backgroundColor: colors.background, borderColor: colors.border },
                                currentLevel === level && { backgroundColor: getStockColor(level), borderColor: getStockColor(level) }
                            ]}
                        >
                            <Text style={[
                                styles.levelButtonText,
                                { color: colors.text.secondary },
                                currentLevel === level && { color: 'white' }
                            ]}>
                                {letter}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity
                    delayPressIn={0}
                    onPress={() => onRemove(item._id)}
                    style={[styles.removeButton]}
                >
                    <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default function PantryScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { t, language } = useTranslation();

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

    const pendingPantrySyncRef = React.useRef<Record<string, 'FULL' | 'MEDIUM' | 'LOW'>>({});
    const pantrySyncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleStockChange = useCallback((itemId: string, newLevel: 'FULL' | 'MEDIUM' | 'LOW') => {
        // 1. Respuesta visual instantánea en cache local (0ms)
        queryClient.setQueryData<PantryItem[]>(['pantry'], (old) => {
            if (!old) return [];
            return old.map(item => item._id === itemId ? { ...item, stockLevel: newLevel } : item);
        });

        // 2. Agregar a cola de sincronización
        pendingPantrySyncRef.current[itemId] = newLevel;

        // 3. Temporizador debounce de 800ms
        if (pantrySyncTimerRef.current) clearTimeout(pantrySyncTimerRef.current);
        pantrySyncTimerRef.current = setTimeout(async () => {
            const itemsToSync = { ...pendingPantrySyncRef.current };
            pendingPantrySyncRef.current = {};

            try {
                await Promise.all(
                    Object.entries(itemsToSync).map(([id, stockLevel]) =>
                        api.put(`/pantry/${id}`, { stockLevel })
                    )
                );
            } catch (e) {
                console.error("Debounced pantry stock sync error:", e);
            }
        }, 800);
    }, [queryClient]);

    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        actions: [] as ModalAction[]
    });

    const showAlert = (title: string, message: string, actions: ModalAction[] = []) => {
        setModalConfig({ title, message, actions });
        setModalVisible(true);
    };

    const confirmDelete = (id: string) => {
        showAlert(
            language === 'es' ? 'Eliminar Elemento' : 'Delete Item',
            language === 'es' ? '¿Estás seguro de que deseas eliminar este elemento?' : 'Are you sure you want to delete this item?',
            [
                { text: t('common.cancel'), style: "cancel", onPress: () => setModalVisible(false) },
                { text: t('common.delete'), onPress: () => { deleteMutation.mutate(id); setModalVisible(false); }, style: 'destructive' }
            ]
        );
    };

    const handleRemove = useCallback((itemId: string) => {
        confirmDelete(itemId);
    }, [confirmDelete]);

    const getStockColor = useCallback((level?: string) => {
        switch (level) {
            case 'FULL': return '#10b981'; // Green
            case 'MEDIUM': return '#f59e0b'; // Amber
            case 'LOW': return '#f97316'; // Orange
            default: return COLORS.text.secondary;
        }
    }, []);

    const renderItem = useCallback(({ item, index }: { item: PantryItem; index: number }) => {
        return (
            <PantryItemRow
                item={item}
                onStockChange={handleStockChange}
                onRemove={handleRemove}
                getStockColor={getStockColor}
                t={t}
            />
        );
    }, [handleStockChange, handleRemove, getStockColor, t]);

    const { colors } = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : isError ? (
                <View style={styles.center}>
                    <Text style={[styles.errorText, { color: colors.error }]}>Error loading pantry: {(error as any).message}</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={pantry}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="basket-outline" size={64} color={colors.text.light} style={{ marginBottom: SPACING.m }} />
                                <Text style={[styles.emptyText, { color: colors.text.primary }]}>{t('pantry.emptyTitle')}</Text>
                                <Text style={[styles.emptySubtext, { color: colors.text.secondary }]}>{t('pantry.emptySubtitle')}</Text>
                                <TouchableOpacity
                                    style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                                    onPress={() => router.push('/pantry/add')}
                                >
                                    <Text style={[styles.emptyButtonText, { color: '#ffffff' }]}>{t('pantry.addItem')}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/pantry/add')}
                    >
                        <Ionicons name="add" size={32} color="#ffffff" />
                    </TouchableOpacity>
                </>
            )}
            <ConfirmModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                actions={modalConfig.actions}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    addButton: {
        position: 'absolute',
        bottom: 50,
        right: SPACING.l,
        backgroundColor: COLORS.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
        zIndex: 100,
        elevation: 5
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
        gap: 6,
    },
    levelButton: {
        width: 35,
        height: 35,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    levelButtonText: {
        fontSize: 10,
        fontWeight: '700',
        color: COLORS.text.secondary,
    },
    removeButton: {
        width: 28,
        height: 28,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
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
