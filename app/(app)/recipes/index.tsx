import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SwipeableRow from "../../../src/components/SwipeableRow";
import api from "../../../src/lib/api.js";
import { useCartStore } from "../../../src/store/useCartStore";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  time: string;
  matchPercentage: number;
}

interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
}

export default function RecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [ingredientInput, setIngredientInput] = useState<string>("");
  const [filtered, setFiltered] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [recipeQuery, setRecipeQuery] = useState<string>("");
  const [ingredientQuery, setIngredientQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const debounceRef = useRef<number | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const handleSwipeRecipe = async (recipe: Recipe) => {
    try {
      // 1. Fetch full details to get ingredients
      // NOTE: If the list endpoint included ingredients, we could skip this.
      const res = await api.get(`/recipes/${recipe._id}`);
      const fullRecipe = res.data?.data ?? res.data;

      if (!fullRecipe.ingredients || fullRecipe.ingredients.length === 0) {
        Alert.alert("Info", "Esta receta no tiene ingredientes listados.");
        return;
      }

      // 2. Add each ingredient to cart
      let addedCount = 0;
      fullRecipe.ingredients.forEach((ingObj: any) => {
        // Handle populated vs unpopulated ingredient
        const ingData = typeof ingObj.ingredient === 'object' ? ingObj.ingredient : null;
        if (ingData) {
          addItem({
            _id: ingData._id,
            name: ingData.name,
            category: ingData.category,
            unit: ingObj.unit // Use recipe unit or ingredient unit?
          });
          addedCount++;
        }
      });

      Alert.alert("🎉 Éxito", `Se agregaron ${addedCount} ingredientes de "${recipe.title}" a la lista.`);

    } catch (err) {
      console.error("Error adding recipe ingredients:", err);
      Alert.alert("Error", "No se pudieron agregar los ingredientes.");
    }
  };

  const fetchRecipes = async (q?: string) => {
    if (q) setSearching(true);
    try {
      const res = await api.get("/recipes", { params: q ? { query: q } : {} });
      const data = res.data?.data ?? res.data;
      //console.log("fetchRecipes query:", q, "response:", res.data);
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Error fetching recipes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllIngredients = async () => {
    try {
      const res = await api.get("/ingredients");
      const data = res.data?.data ?? res.data;
      console.log("fetchIngredients response:", res.data);
      setAllIngredients(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Error fetching ingredients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    fetchAllIngredients();
    // cleanup on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    fetchAllIngredients();
    console.log(selectedIngredients);
    if (selectedIngredients.length > 0) {
      fetchRecipesByIngredients();
    } else {
      fetchRecipes(); // if no ingredients, fetch all recipes again
    }
  }, [selectedIngredients]);

  // debounce search and call server
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // short-circuit: if empty query, fetch all (or keep previous list)
    debounceRef.current = setTimeout(() => {
      fetchRecipes(recipeQuery.trim() ? recipeQuery.trim() : undefined);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };

  }, [recipeQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecipes();
  };

  useEffect(() => {
    if (!ingredientQuery.trim()) {
      setFiltered([]);
      return;
    }

    const lower = ingredientQuery.toLowerCase();
    const matches = allIngredients.filter((i) =>
      i.name.toLowerCase().includes(lower)
    );
    setFiltered(matches.slice(0, 6));
  }, [ingredientQuery, allIngredients]);

  // 🔹 Agregar ingrediente seleccionado
  const addIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.some((i) => i._id === ingredient._id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setIngredientQuery("");
    setFiltered([]);
    fetchRecipesByIngredients();
  };

  const removeIngredient = (id: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i._id !== id));
  };

  const fetchRecipesByIngredients = async () => {
    try {
      const res = await api.post("/recipes/by-ingredients", {
        ingredientIds: selectedIngredients.map(i => i._id),
      });
      console.log("fetchRecipesByIngredients request:", selectedIngredients.map(i => i._id), "response:", res.data);
      setRecipes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <SwipeableRow
      onSwipe={() => handleSwipeRecipe(item)}
      style={{ marginBottom: 16 }}
      actionLabel="Agregar Todo"
    >
      <TouchableOpacity style={styles.recipeCard}
        onPress={() => router.push(`/recipes/${item._id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.recipeContent}>
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
          <Text style={styles.recipeDescription}>{item.description}</Text>
        </View>
        {item.matchPercentage !== undefined && (
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{item.matchPercentage}% coincidencia</Text>
          </View>
        )}
      </TouchableOpacity>
    </SwipeableRow>

  );

  return (

    <View style={styles.container}>
      <View style={styles.ingredientSelector}>

        <Text style={styles.title}>Select Ingredients</Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <>
            <TextInput
              value={ingredientQuery}
              onChangeText={setIngredientQuery}
              placeholder="Type an ingredient..."
              style={styles.input}
            />

            {/* 🔹 Suggestions */}
            {filtered.length > 0 && (
              <View style={styles.suggestions}>
                {filtered.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => addIngredient(item)}
                    style={styles.suggestionItem}
                  >
                    <Text>{item.name}</Text>
                    <Text style={styles.category}>{item.category ?? "—"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 🔹 Selected Ingredients */}
            <View style={styles.selectedContainer}>
              {selectedIngredients.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.chip}
                  onPress={() => removeIngredient(item._id)}
                >
                  <Text style={styles.chipText}>{item.name} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search recipe..."
          value={recipeQuery}
          onChangeText={setRecipeQuery}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {(searching || refreshing) ? (
          <ActivityIndicator style={{ marginLeft: 8 }} />
        ) : null}
      </View>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item._id}
        renderItem={renderRecipeItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  ingredientSelector: {
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12, color: "#2c3e50" },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e6ed",
  },
  suggestions: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e0e6ed",
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  category: { color: "#7f8c8d", fontSize: 12 },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: "#e8f4fd",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipText: { color: "#2980b9", fontWeight: "500" },
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 24,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
    // marginBottom handled by wrapper
  },
  matchBadge: {
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  matchText: {
    color: '#27ae60',
    fontWeight: '600',
    fontSize: 12
  },
  recipeContent: {
    padding: 16,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  timeContainer: {
    backgroundColor: '#e8f4fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#2980b9',
    fontWeight: '500',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});