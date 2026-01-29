import { COLORS, FONTS, SPACING } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/useAuth";
import { Recipe } from "@/src/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import api from "../../../src/lib/api";


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
      setError(err?.response?.data?.message ?? err.message ?? "Error al cargar la receta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRecipe(id);
  }, [id]);

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>ID de receta no proporcionado.</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Retry" onPress={() => fetchRecipe(id)} />
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la receta.</Text>
        <Button title="Back" onPress={() => router.back()} />
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} />
        ) : null}

        <View style={styles.contentHeader}>
          <Text style={styles.title}>{recipe.title}</Text>
        </View>

        {recipe.time ? <Text style={styles.time}>⏱ {recipe.time}</Text> : null}
        <Text style={styles.description}>{recipe.description}</Text>

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            {recipe.ingredients.map((ing, idx) => (
              <Text key={idx} style={styles.listItem}>• {ing.quantity} {ing.unit} de {typeof ing.ingredient === "object" ? ing.ingredient.name : ing.ingredient}</Text>
            ))}
          </>
        )}

        {recipe.steps && recipe.steps.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Preparación</Text>
            {recipe.steps?.map((step, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {step}
              </Text>
            ))}
          </>
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    width: 70, // Fixed width to balance back button
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: SPACING.xs,
    width: 70, // Fixed width to balance right side
  },
  actionButton: {
    padding: 4
  },
  scrollContent: {
    padding: SPACING.m,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.background,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: SPACING.m,
    marginBottom: SPACING.m,
    resizeMode: "cover",
  },
  contentHeader: {
    marginBottom: 8,
  },
  title: {
    fontSize: FONTS.sizes.h2,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  time: {
    fontSize: FONTS.sizes.body,
    color: COLORS.primary,
    marginBottom: SPACING.m,
    fontWeight: '600',
  },
  description: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    lineHeight: 24,
    marginBottom: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "600",
    marginTop: SPACING.s,
    marginBottom: SPACING.s,
    color: COLORS.text.primary,
  },
  listItem: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  error: {
    color: COLORS.error,
    marginBottom: 12,
  },
});