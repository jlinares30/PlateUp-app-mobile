import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import api from "../../../src/lib/api";

interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
  __v?: number;
}

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
      setError(err?.response?.data?.message ?? err.message ?? "Error al cargar ingrediente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchIngredient(id);
  }, [id]);

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>ID no proporcionado.</Text>
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
        <Button title="Retry" onPress={() => fetchIngredient(id)} />
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (!ingredient) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el ingrediente.</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.title}>{ingredient.name}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{ingredient.category ?? "No category"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Unit</Text>
        <Text style={styles.value}>{ingredient.unit ?? "unit"}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>ID</Text>
        <Text style={styles.value}>{ingredient._id}</Text>
      </View>

      {typeof ingredient.__v !== "undefined" && (
        <View style={styles.row}>
          <Text style={styles.label}>__v</Text>
          <Text style={styles.value}>{String(ingredient.__v)}</Text>
        </View>
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
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 16,
    textAlign: "left",
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  value: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "600",
    maxWidth: "70%",
    textAlign: "right",
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
  },
});