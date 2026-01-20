import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, SlideOutRight } from "react-native-reanimated";
import api from "../../../src/lib/api";
import { ShoppingListItem } from "../../../src/types";

export default function ShoppingCart() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Fetch Shopping List
  const { data: cart = [], isLoading, error } = useQuery({
    queryKey: ['shoppingList'],
    queryFn: async () => {
      const res = await api.get("/shopping-list");
      return res.data ?? [];
    }
  });

  // 2. Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      await api.put(`/shopping-list/${itemId}`, { quantity });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] }),
    onError: () => Alert.alert("Error", "Could not update item")
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/shopping-list/${itemId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] }),
    onError: () => Alert.alert("Error", "Could not remove item")
  });

  // Helper functions
  const handleChangeQuantity = (item: ShoppingListItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      handleRemove(item._id);
    } else {
      updateMutation.mutate({ itemId: item._id, quantity: newQuantity });
    }
  };

  const handleRemove = (itemId: string) => {
    Alert.alert("Remove", "Remove this item from shopping list?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeMutation.mutate(itemId) }
    ]);
  };

  const totalItems = cart.reduce((s: number, i: ShoppingListItem) => s + i.quantity, 0);

  const renderItem = ({ item, index }: { item: ShoppingListItem; index: number }) => {
    // Handle populated ingredient or fallback
    const name = typeof item.ingredient === 'object' ? item.ingredient.name : "Ingredient";
    const unit = typeof item.ingredient === 'object' ? item.ingredient.unit : item.unit;
    const category = typeof item.ingredient === 'object' ? item.ingredient.category : "Misc";

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        exiting={SlideOutRight}
        style={styles.row}
      >
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {category ?? "Uncategorized"} · {unit ?? "unit"}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleChangeQuantity(item, -1)}
            disabled={updateMutation.isPending}
          >
            <Ionicons name="remove" size={16} color={COLORS.text.primary} />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleChangeQuantity(item, 1)}
            disabled={updateMutation.isPending}
          >
            <Ionicons name="add" size={16} color={COLORS.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item._id)}
            disabled={removeMutation.isPending}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Shopping List</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{cart.length}</Text>
          <Text style={styles.summaryLabel}>Items</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalItems}</Text>
          <Text style={styles.summaryLabel}>Total Qty</Text>
        </View>
      </View>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={COLORS.text.light} style={{ marginBottom: SPACING.m }} />
          <Text style={styles.emptyText}>Your list is empty.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push("/ingredients")}
          >
            <Text style={styles.emptyButtonText}>Add Ingredients</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.l,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONTS.sizes.h3,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: SPACING.m,
    margin: SPACING.m,
    backgroundColor: COLORS.card,
    borderRadius: SPACING.m,
    ...SHADOWS.small
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.primary,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  list: {
    paddingHorizontal: SPACING.m,
    paddingBottom: 80
  },
  row: {
    backgroundColor: COLORS.card,
    padding: SPACING.m,
    borderRadius: SPACING.m,
    marginBottom: SPACING.s,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...SHADOWS.small,
  },
  info: { flex: 1, marginRight: SPACING.m },
  name: { fontSize: FONTS.sizes.body, fontWeight: "600", color: COLORS.text.primary },
  meta: { marginTop: 4, color: COLORS.text.secondary, fontSize: FONTS.sizes.small },
  controls: { flexDirection: 'row', alignItems: "center" },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    textAlign: "center",
    fontSize: FONTS.sizes.body,
    fontWeight: "600",
    minWidth: 30,
    color: COLORS.text.primary
  },
  removeBtn: { marginLeft: SPACING.s, padding: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: SPACING.xl },
  emptyText: { color: COLORS.text.secondary, fontSize: FONTS.sizes.h3, marginBottom: SPACING.l },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.xl,
    borderRadius: SPACING.l,
    ...SHADOWS.medium,
  },
  emptyButtonText: {
    color: COLORS.card,
    fontWeight: '700',
    fontSize: FONTS.sizes.body,
  }
});



