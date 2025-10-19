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
    View,
} from "react-native";
import api from "../../../src/lib/api";

interface RecipeRef {
  _id: string;
  title: string;
}

interface Meal {
  _id: string;
  type: string;
  recipe: RecipeRef;
}

interface DayPlan {
  _id: string;
  day: string;
  meals: Meal[];
}

interface MealPlan {
  _id: string;
  user: string;
  title: string;
  description: string;
  days: DayPlan[];
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}

export default function MealPlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlan = async (planId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/meal-plans/${planId}`);
      const data = res.data?.data ?? res.data;
      setMealPlan(data);
    } catch (err: any) {
      console.error("fetchMealPlan:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Error al cargar el plan de comidas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchMealPlan(id);
  }, [id]);

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>ID no proporcionado.</Text>
        <Button title="Volver" onPress={() => router.back()} />
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
        <Button title="Reintentar" onPress={() => fetchMealPlan(id)} />
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  if (!mealPlan) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el plan de comidas.</Text>
        <Button title="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  const openRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Volver" onPress={() => router.back()} />

      {mealPlan.imageUrl ? (
        <Image source={{ uri: mealPlan.imageUrl }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{mealPlan.title}</Text>
      {mealPlan.description ? <Text style={styles.description}>{mealPlan.description}</Text> : null}

      {/* Renderizamos los días del plan */}
      {mealPlan.days && mealPlan.days.length > 0 ? (
        mealPlan.days.map((day) => (
          <View key={day._id} style={styles.daySection}>
            <Text style={styles.sectionTitle}>📅 {day.day}</Text>

            {day.meals.map((meal) => (
              <TouchableOpacity
                key={meal._id}
                style={styles.mealRow}
                activeOpacity={0.8}
                onPress={() => openRecipe(meal.recipe._id)}
              >
                <View>
                  <Text style={styles.mealType}>{meal.type.toUpperCase()}</Text>
                  <Text style={styles.mealRecipe}>{meal.recipe.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No hay comidas en este plan.</Text>
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
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: "#444",
    lineHeight: 20,
    marginBottom: 8,
  },
  daySection: {
    marginTop: 16,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  mealRow: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eef6fb",
  },
  mealType: {
    fontSize: 13,
    color: "#2980b9",
    fontWeight: "600",
  },
  mealRecipe: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: 20,
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
});
