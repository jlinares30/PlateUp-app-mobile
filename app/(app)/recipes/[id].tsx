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

interface Ingredient {
  _id: string;
  ingredient: {
    _id: string;
    name: string;
  } | string;
  quantity: number;
  unit: string;
}

interface Recipe {
  _id: string;
  title: string;
  description: string;
  time?: string;
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: string[];
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

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
        const userRes = await api.get('/auth/me'); // Or endpoint to get my favorites
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
    <ScrollView contentContainerStyle={styles.container}>
      {recipe.imageUrl ? (
        <Image source={{ uri: recipe.imageUrl }} style={styles.image} />
      ) : null}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{recipe.title}</Text>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={28}
            color={isFavorite ? "red" : "#2c3e50"}
          />
        </TouchableOpacity>
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: "cover",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    flex: 1,
  },
  time: {
    fontSize: 13,
    color: "#2980b9",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#444",
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
    color: "#2c3e50",
  },
  listItem: {
    fontSize: 15,
    color: "#555",
    marginBottom: 6,
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
});