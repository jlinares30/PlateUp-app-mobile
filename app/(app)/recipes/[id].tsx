import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/useAuth";
import { Recipe } from "@/src/types";
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
  View
} from "react-native";
import api from "../../../src/lib/api";
import { normalizeTags } from "../../../src/lib/utils";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);


  const isAuthor = recipe && user && (recipe.user === user._id || recipe.user === user.id);

  const toggleFavorite = async () => {
    if (!recipe) return;
    try {
      const res = await api.post(`/recipes/${recipe._id}/favorite`);
      setIsFavorite(res.data.isFavorite);
    } catch (e) {
      console.error("Error toggling favorite:", e);
    }
  };

  const fetchRecipe = async (recipeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/recipes/${recipeId}`);
      const data = res.data?.data ?? res.data;

      setRecipe(data);

      // Check if favorite
      try {
        const myFavorites = await api.get('/recipes/favorites/all');
        const isFav = myFavorites.data.some((fav: any) => fav._id === recipeId);
        setIsFavorite(isFav);
      } catch (e) {
        console.log("Could not check favorites");
      }
    } catch (err: any) {
      console.error("fetchRecipe error:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Error retrieving recipe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRecipe(id);
  }, [id]);

  if (!id || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "Recipe not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Recipe Details</Text>
        <View style={styles.headerRight}>
          {isAuthor && (
            <TouchableOpacity onPress={() => router.push(`/recipes/edit/${recipe._id}`)} style={styles.actionButton}>
              <Ionicons name="pencil" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={toggleFavorite} style={styles.actionButton}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={28}
              color={isFavorite ? "red" : COLORS.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image || "https://via.placeholder.com/400" }}
            style={styles.image}
          />
          {/* Overlay Gradient or Badges */}
          <View style={styles.imageOverlay}>
            <View style={[styles.badge, styles.categoryBadge]}>
              <Text style={styles.badgeText}>{recipe.category || "General"}</Text>
            </View>
          </View>
        </View>

        {/* Title & Meta Info */}
        <View style={styles.section}>
          <Text style={styles.title}>{recipe.title}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{recipe.time}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="flame-outline" size={18} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{recipe.difficulty || "Medium"}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name={recipe.isPublic ? "globe-outline" : "lock-closed-outline"} size={18} color={COLORS.text.secondary} />
              <Text style={styles.metaText}>{recipe.isPublic ? "Public" : "Private"}</Text>
            </View>
          </View>

          {recipe.description ? <Text style={styles.description}>{recipe.description}</Text> : null}
        </View>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.card}>
              {recipe.ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.ingredientRow, idx === recipe.ingredients!.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.bullet} />
                  <Text style={styles.ingredientText}>
                    <Text style={{ fontWeight: '700' }}>{ing.quantity} {ing.unit}</Text>
                    <Text> of </Text>
                    <Text style={{ color: COLORS.text.primary }}>{typeof ing.ingredient === "object" ? ing.ingredient.name : ing.ingredient}</Text>
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Steps */}
        {recipe.steps && recipe.steps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.steps?.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={styles.stepNumberContainer}>
                  <Text style={styles.stepNumber}>{idx + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags Section */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {normalizeTags(recipe.tags).map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    width: 70,
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: SPACING.xs,
    width: 70,
  },
  actionButton: {
    padding: 4
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
    height: 280,
    position: 'relative',
    marginBottom: SPACING.m,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.m,
    left: SPACING.m,
    flexDirection: 'row',
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    ...SHADOWS.small,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONTS.sizes.small,
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: SPACING.m,
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text.primary,
    marginBottom: SPACING.s,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.m,
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: SPACING.m,
    ...SHADOWS.small,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.m,
  },
  description: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    marginBottom: SPACING.m,
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.m,
    padding: SPACING.m,
    ...SHADOWS.small,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginRight: SPACING.m,
  },
  ingredientText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
  },
  stepNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
    marginTop: 2,
  },
  stepNumber: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONTS.sizes.small,
  },
  stepText: {
    flex: 1,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  error: {
    color: COLORS.error,
    marginBottom: 12,
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
});