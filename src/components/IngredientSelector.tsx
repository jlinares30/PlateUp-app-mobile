import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { useTranslation } from "@/src/lib/i18n";
import { Ingredient } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface IngredientSelectorProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (ingredient: Ingredient) => void;
}

export default function IngredientSelector({
    visible,
    onClose,
    onSelect,
}: IngredientSelectorProps) {
    const { t, language } = useTranslation();
    const { colors } = useThemeColors();
    const [search, setSearch] = useState("");

    const { data: ingredients = [], isLoading } = useQuery({
        queryKey: ["ingredients", search],
        queryFn: async () => {
            const res = await api.get("/ingredients", {
                params: { query: search },
            });
            return res.data;
        },
    });

    const handleSelect = (ingredient: Ingredient) => {
        onSelect(ingredient);
        onClose();
        setSearch("");
    };

    const renderItem = ({ item }: { item: Ingredient }) => (
        <TouchableOpacity style={[styles.item, { backgroundColor: colors.card }]} onPress={() => handleSelect(item)}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                <Ionicons name="nutrition-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text.primary }]}>{item.name}</Text>
                <Text style={[styles.unit, { color: colors.text.secondary }]}>{item.category || (language === 'es' ? "Sin categoría" : "Uncategorized")}</Text>
            </View>
            <Text style={[styles.unit, { color: colors.text.secondary }]}>{item.unit}</Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text.primary }]}>{language === 'es' ? "Seleccionar Ingrediente" : "Select Ingredient"}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons
                            name="search"
                            size={20}
                            color={colors.text.light}
                            style={styles.searchIcon}
                        />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text.primary }]}
                            placeholder={t('pantry.searchPlaceholder')}
                            placeholderTextColor={colors.text.light}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <FlatList
                            data={ingredients}
                            renderItem={renderItem}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: SPACING.l,
        borderTopRightRadius: SPACING.l,
        height: "80%",
        padding: SPACING.m,
        ...SHADOWS.large,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: SPACING.m,
        paddingHorizontal: SPACING.s,
    },
    title: {
        fontSize: FONTS.sizes.h2,
        fontWeight: "700",
        color: COLORS.text.primary,
    },
    closeButton: {
        padding: SPACING.xs,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: SPACING.m,
        paddingHorizontal: SPACING.m,
        marginBottom: SPACING.m,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 50,
    },
    searchIcon: {
        marginRight: SPACING.s,
    },
    searchInput: {
        flex: 1,
        fontSize: FONTS.sizes.body,
        color: COLORS.text.primary,
        height: "100%",
    },
    list: {
        paddingBottom: SPACING.xl,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        padding: SPACING.m,
        borderRadius: SPACING.m,
        marginBottom: SPACING.s,
        ...SHADOWS.small,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: SPACING.m,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: FONTS.sizes.body,
        fontWeight: "600",
        color: COLORS.text.primary,
    },
    unit: {
        fontSize: FONTS.sizes.small,
        color: COLORS.text.secondary,
    },
    emptyText: {
        textAlign: "center",
        color: COLORS.text.secondary,
        marginTop: SPACING.xl,
        fontSize: FONTS.sizes.body,
    },
});
