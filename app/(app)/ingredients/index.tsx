import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import SwipeableIngredientItem from "../../../src/components/SwipeableIngredientItem";
import api from "../../../src/lib/api";

// Types
interface Ingredient {
  _id: string;
  name: string;
  unit?: string;
  image?: string;
  category?: string;
}

export default function IngredientsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

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

  // Fetch Ingredients with useQuery
  const {
    data: ingredients = [],
    isLoading,
    isFetching,
    error,
    refetch
  } = useQuery({
    queryKey: ['ingredients', debouncedQuery],
    queryFn: async () => {
      const res = await api.get("/ingredients", {
        params: debouncedQuery.trim() ? { query: debouncedQuery.trim() } : {}
      });
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  // Add Mutation
  const addMutation = useMutation({
    mutationFn: async (item: Ingredient) => {
      const res = await api.post("/shopping-list", {
        ingredientId: item._id,
        quantity: 1,
        unit: item.unit || 'unit'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
      Alert.alert("Success", "Added to shopping list");
    },
    onError: () => {
      Alert.alert("Error", "Could not add to list");
    }
  });

  /* 
   * Render Item using SwipeableIngredientItem
   */
  const renderItem = ({ item, index }: { item: Ingredient; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).springify().damping(20)}>
      <SwipeableIngredientItem
        item={item}
        onPress={() => router.push(`./ingredients/${item._id}`)}
        onAdd={(authItem) => addMutation.mutate(authItem)}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.light} style={styles.searchIcon} />
          <TextInput
            placeholder="Search ingredient..."
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            placeholderTextColor={COLORS.text.light}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {(isFetching) && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>

        {error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>Error loading ingredients</Text>
          </View>
        ) : null}

        <FlatList
          data={ingredients}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.center}>
                <Text style={styles.emptyText}>No ingredients found.</Text>
              </View>
            ) : null
          }
        />
        {isLoading && !isFetching && ingredients.length === 0 && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
    zIndex: 10,
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
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    marginVertical: SPACING.m,
    marginHorizontal: SPACING.m,
    paddingHorizontal: SPACING.m,
    height: 48,
    borderRadius: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  searchIcon: {
    marginRight: SPACING.s,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.body,
    color: COLORS.text.primary,
  },
  listContainer: {
    padding: SPACING.m,
    paddingTop: 0,
  },
  // Removed unused styles: card, cardImage, cardInfo, cardName, cardDetail, addButton
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.body
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    fontSize: FONTS.sizes.body
  }
});