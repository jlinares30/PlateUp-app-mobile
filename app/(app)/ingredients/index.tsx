import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Alert, Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import SwipeableIngredientItem from "../../../src/components/SwipeableIngredientItem";
import api from "../../../src/lib/api";
import { Ingredient } from "../../../src/store/useCartStore"; // Keeping Interface import if needed, or move to types

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THRESHOLD = SCREEN_WIDTH * 0.25;

export default function IngredientsScreen() {

  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Debounced Search State
  const [query, setQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // 2. Fetch Ingredients with useQuery
  const {
    data: ingredients = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['ingredients', debouncedQuery],
    queryFn: async () => {
      //console.log("[DEBUG] Fetching ingredients with query:", debouncedQuery);
      const res = await api.get("/ingredients", {
        params: debouncedQuery.trim() ? { query: debouncedQuery.trim() } : {}
      });
      //console.log("[DEBUG] Fetch response data:", res.data);
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
  });

  // 3. Add Mutation
  const addMutation = useMutation({
    mutationFn: async (item: Ingredient) => {
      console.log("[DEBUG] Adding item to list:", item);
      const res = await api.post("/shopping-list", {
        ingredientId: item._id,
        quantity: 1,
        unit: item.unit
      });
      console.log("[DEBUG] Add item response:", res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
      Alert.alert("Añadido", "Ingrediente agregado a la lista.");
    },
    onError: () => {
      Alert.alert("Error", "No se pudo agregar el ingrediente.");
    }
  });

  const handleAddToShoppingList = (item: Ingredient) => {
    addMutation.mutate(item);
  };

  const renderItem = ({ item }: { item: Ingredient }) => (
    <SwipeableIngredientItem
      item={item}
      onPress={() => router.push(`./ingredients/${item._id}`)}
      onAdd={handleAddToShoppingList}
    />
  );

  if (isLoading && !ingredients.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingredientes</Text>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search ingredient..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {(isFetching) ? (
          <ActivityIndicator style={{ marginLeft: 8 }} />
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{(error as Error).message || "Error cargando ingredientes"}</Text> : null}

      <FlatList
        data={ingredients}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay ingredientes</Text>}
        contentContainerStyle={ingredients.length === 0 ? { flex: 1, justifyContent: "center" } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
    paddingTop: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 12,
    textAlign: "center"
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e6eef8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  empty: {
    textAlign: "center",
    color: "#7f8c8d"
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 12
  }
});