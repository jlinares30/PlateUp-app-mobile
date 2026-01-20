import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import SwipeableRow from "../../../src/components/SwipeableRow";
import api from "../../../src/lib/api";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  time: string;
  matchPercentage: number;
  imageUrl?: string;
  ingredients?: any[];
}

interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
}

export default function RecipesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [recipeQuery, setRecipeQuery] = useState<string>("");
  const [ingredientQuery, setIngredientQuery] = useState<string>("");
  const [debouncedRecipeQuery, setDebouncedRecipeQuery] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedRecipeQuery(recipeQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [recipeQuery]);

  // 1. Fetch Items query
  const { data: allIngredients = [] } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const res = await api.get("/ingredients");
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 60 // 1 hour cache for simple list
  });

  // 2. Filter ingredients for suggestion box
  const filteredIngredients = ingredientQuery.trim()
    ? allIngredients.filter((i: Ingredient) => i.name.toLowerCase().includes(ingredientQuery.toLowerCase())).slice(0, 6)
    : [];

  // 3. Main Recipe Query
  const {
    data: recipes = [],
    isLoading,
    isRefetching,
    refetch,
    error
  } = useQuery({
    queryKey: ['recipes', selectedIngredients.map(i => i._id).sort().join(','), debouncedRecipeQuery],
    queryFn: async () => {
      let data: Recipe[] = [];

      if (selectedIngredients.length > 0) {
        // Fetch by ingredients
        const res = await api.post("/recipes/by-ingredients", {
          ingredientIds: selectedIngredients.map(i => i._id),
        });
        data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

        // Client-side text filter
        if (debouncedRecipeQuery.trim()) {
          const lowerQ = debouncedRecipeQuery.toLowerCase();
          data = data.filter(r => r.title.toLowerCase().includes(lowerQ));
        }

        // Sort by match
        data.sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0));

      } else {
        // Normal fetch
        const params = debouncedRecipeQuery.trim() ? { query: debouncedRecipeQuery.trim() } : {};
        const res = await api.get("/recipes", { params });
        data = res.data?.data ?? res.data;
        if (!Array.isArray(data)) data = [];
      }
      return data;
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  // 4. Mutation to add to shopping list
  const addAllMutation = useMutation({
    mutationFn: async (recipe: Recipe) => {
      // Fetch full recipe to get ingredients
      const res = await api.get(`/recipes/${recipe._id}`);
      const fullRecipe = res.data?.data ?? res.data;

      if (!fullRecipe.ingredients || fullRecipe.ingredients.length === 0) {
        throw new Error("No ingredients in recipe");
      }

      const promises = fullRecipe.ingredients.map(async (ingObj: any) => {
        const ingData = typeof ingObj.ingredient === 'object' ? ingObj.ingredient : null;
        if (ingData) {
          await api.post("/shopping-list", {
            ingredientId: ingData._id,
            quantity: ingObj.quantity || 1,
            unit: ingObj.unit
          });
        }
      });
      await Promise.all(promises);
      return fullRecipe.ingredients.length;
    },
    onSuccess: (count, variables) => {
      Alert.alert("Success", `Added ingredients from "${variables.title}" to list.`);
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    },
    onError: (err: any) => {
      Alert.alert("Info", err.message === "No ingredients in recipe" ? err.message : "Could not add items.");
    }
  });


  // Helpers
  const addIngredient = (ingredient: Ingredient) => {
    if (!selectedIngredients.some((i) => i._id === ingredient._id)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setIngredientQuery("");
  };

  const removeIngredient = (id: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i._id !== id));
  };

  const handleSwipeRecipe = (item: Recipe) => {
    addAllMutation.mutate(item);
  };

  const renderRecipeItem = ({ item, index }: { item: Recipe; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).springify().damping(20)}>
      <SwipeableRow
        onSwipe={() => handleSwipeRecipe(item)}
        style={{ marginBottom: SPACING.m }}
        actionLabel="Add All"
      >
        <Link href={`/recipes/${item._id}`} asChild>
          <TouchableOpacity style={styles.recipeCard} activeOpacity={0.9}>
            <Image
              source={{ uri: item.imageUrl || "https://via.placeholder.com/300" }}
              style={styles.cardImage}
            />
            <View style={styles.recipeContent}>
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeTitle}>{item.title}</Text>
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>
              <Text style={styles.recipeDescription} numberOfLines={2}>{item.description}</Text>
            </View>
            {item.matchPercentage !== undefined && (
              <View style={[styles.matchBadge, { opacity: item.matchPercentage > 0 ? 1 : 0 }]}>
                <Text style={styles.matchText}>{Math.round(item.matchPercentage)}% Match</Text>
              </View>
            )}
            {addAllMutation.isPending && addAllMutation.variables?._id === item._id && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </Link>
      </SwipeableRow>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.ingredientSelector}>
          <Text style={styles.sectionTitle}>Filter by Ingredients</Text>

          <View style={styles.searchWrapper}>
            <TextInput
              value={ingredientQuery}
              onChangeText={setIngredientQuery}
              placeholder="Type an ingredient..."
              style={styles.input}
              placeholderTextColor={COLORS.text.light}
            />
            {ingredientQuery.length > 0 && (
              <TouchableOpacity onPress={() => setIngredientQuery('')} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={20} color={COLORS.text.light} />
              </TouchableOpacity>
            )}
          </View>

          {/* Suggestions */}
          {filteredIngredients.length > 0 && (
            <View style={styles.suggestions}>
              {filteredIngredients.map((item: Ingredient) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => addIngredient(item)}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{item.name}</Text>
                  <Text style={styles.category}>{item.category ?? "—"}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Ingredients */}
          <View style={styles.selectedContainer}>
            {selectedIngredients.map((item) => (
              <TouchableOpacity
                key={item._id}
                style={styles.chip}
                onPress={() => removeIngredient(item._id)}
              >
                <Text style={styles.chipText}>{item.name}</Text>
                <Ionicons name="close-circle" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.mainSearch}>
          <Ionicons name="search" size={20} color={COLORS.text.light} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search recipe title..."
            value={recipeQuery}
            onChangeText={setRecipeQuery}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            placeholderTextColor={COLORS.text.light}
          />
          {isLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>

        <FlatList
          data={recipes}
          keyExtractor={(item) => item._id}
          renderItem={renderRecipeItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No recipes found.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  ingredientSelector: {
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.body,
    fontWeight: "600",
    marginBottom: SPACING.s,
    color: COLORS.text.primary
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SPACING.s,
    paddingHorizontal: SPACING.s,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.s,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.primary,
  },
  suggestions: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.s,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 100,
    ...SHADOWS.medium,
  },
  suggestionItem: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  suggestionText: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.body,
  },
  category: { color: COLORS.text.light, fontSize: FONTS.sizes.small },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: SPACING.s,
    gap: SPACING.s,
  },
  chip: {
    backgroundColor: COLORS.primary + '15', // 15% opacity
    borderRadius: SPACING.l,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  chipText: { color: COLORS.primary, fontWeight: "600", fontSize: FONTS.sizes.small },
  mainSearch: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.m,
    paddingHorizontal: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.primary,
  },
  categoryChip: {
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.m,
    backgroundColor: COLORS.background,
    borderRadius: SPACING.xl,
    marginRight: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: COLORS.card,
  },
  listContainer: {
    padding: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: 100,
  },
  recipeCard: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.l,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  recipeContent: {
    padding: SPACING.m,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.s,
  },
  recipeTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    color: COLORS.text.primary,
    flex: 1,
    marginRight: SPACING.s,
  },
  recipeDescription: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: SPACING.s,
  },
  timeText: {
    marginLeft: 4,
    fontSize: FONTS.sizes.tiny,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  matchBadge: {
    position: 'absolute',
    top: SPACING.m,
    right: SPACING.m,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchText: {
    color: '#fff',
    fontSize: FONTS.sizes.tiny,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.secondary,
  }
});