import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ingredient } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../../src/lib/api";

export default function IngredientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredient = async (ingredientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/ingredients/${ingredientId}`);
      const data = res.data?.data ?? res.data;
      setIngredient(data ?? null);
    } catch (err: any) {
      console.error("fetchIngredient:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Error loading ingredient");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchIngredient(id);
  }, [id]);

  if (!id || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !ingredient) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "Ingredient not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderMacro = (label: string, value: number = 0, color: string) => (
    <View style={styles.macroCard}>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Ingredient Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: ingredient.image || "https://img.icons8.com/color/480/vegetables.png" }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerSection}>
          <Text style={styles.title}>{ingredient.name}</Text>
          <View style={styles.badgesRow}>
            {ingredient.category && (
              <View style={styles.badge}>
                <Ionicons name="pricetag-outline" size={14} color={COLORS.primary} />
                <Text style={styles.badgeText}>{ingredient.category}</Text>
              </View>
            )}
            {ingredient.unit && (
              <View style={[styles.badge, styles.unitBadge]}>
                <Ionicons name="scale-outline" size={14} color={COLORS.text.secondary} />
                <Text style={[styles.badgeText, { color: COLORS.text.secondary }]}>{ingredient.unit}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nutrition Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition (per 100g)</Text>

          <View style={styles.caloriesCard}>
            <View>
              <Text style={styles.caloriesLabel}>Energy</Text>
              <Text style={styles.caloriesValue}>{ingredient.calories || 0}</Text>
            </View>
            <Text style={styles.kcalText}>kcal</Text>
          </View>

          <View style={styles.macrosContainer}>
            {renderMacro("Protein", ingredient.macros?.protein, "#3b82f6")}
            {renderMacro("Carbs", ingredient.macros?.carbs, "#eab308")}
            {renderMacro("Fat", ingredient.macros?.fat, "#ef4444")}
            {renderMacro("Fiber", ingredient.macros?.fiber, "#10b981")}
          </View>
        </View>

        {/* Tags Section */}
        {ingredient.tags && ingredient.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {ingredient.tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: SPACING.xs,
    width: 40,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.m,
  },
  image: {
    width: '60%',
    height: '60%',
  },
  headerSection: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: SPACING.s,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    gap: 4,
  },
  unitBadge: {
    backgroundColor: COLORS.border,
  },
  badgeText: {
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: SPACING.l,
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: SPACING.m,
  },
  caloriesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: SPACING.m,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  caloriesLabel: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text.primary,
  },
  kcalText: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '600',
    color: COLORS.text.light,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.s,
  },
  macroCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.s,
    borderRadius: SPACING.m,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 10,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  tagChip: {
    backgroundColor: COLORS.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
  },
  error: {
    color: COLORS.error,
    marginBottom: 12,
    fontSize: FONTS.sizes.body,
  },
  retryButton: {
    padding: SPACING.m,
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.m,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});