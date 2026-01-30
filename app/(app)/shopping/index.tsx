import ConfirmModal, { ModalAction } from '@/src/components/ConfirmModal';
import Skeleton from "@/src/components/Skeleton";
import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown, SlideOutRight } from "react-native-reanimated";
import Toast from 'react-native-toast-message';
import api from "../../../src/lib/api";
import { PantryItem, ShoppingListItem } from "../../../src/types";

const ShoppingItemSkeleton = () => (
  <View style={styles.row}>
    <View style={styles.info}>
      <Skeleton width={120} height={20} style={{ marginBottom: 4 }} />
      <Skeleton width={80} height={14} />
    </View>
    <View style={styles.controls}>
      <Skeleton width={32} height={32} borderRadius={8} />
      <Skeleton width={30} height={20} style={{ marginHorizontal: 8 }} />
      <Skeleton width={32} height={32} borderRadius={8} />
      <Skeleton width={24} height={24} style={{ marginLeft: SPACING.s }} />
    </View>
  </View>
);

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

  // Fetch Pantry for checking duplicates/merging
  const { data: pantry = [] } = useQuery({
    queryKey: ['pantry'],
    queryFn: async () => {
      const res = await api.get('/pantry');
      return res.data ?? [];
    }
  });

  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  // Load added items from AsyncStorage on mount
  React.useEffect(() => {
    const loadAddedItems = async () => {
      try {
        const stored = await AsyncStorage.getItem('addedToPantryIds');
        if (stored) {
          setAddedItems(new Set(JSON.parse(stored)));
        }
      } catch (e) {
        console.error("Failed to load added items state", e);
      }
    };
    loadAddedItems();
  }, []);

  // Helper to update state and persistence
  const updateAddedItems = async (newAddedIds: string[]) => {
    setAddedItems(prev => {
      const next = new Set(prev);
      newAddedIds.forEach(id => next.add(id));

      // Persist to AsyncStorage
      AsyncStorage.setItem('addedToPantryIds', JSON.stringify(Array.from(next))).catch(e =>
        console.error("Failed to save added items state", e)
      );

      return next;
    });
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    actions: [] as ModalAction[]
  });

  const showAlert = (title: string, message: string, actions: ModalAction[] = []) => {
    setModalConfig({ title, message, actions });
    setModalVisible(true);
  };

  // 2. Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ itemId, quantity, checked }: { itemId: string; quantity?: number; checked?: boolean }) => {
      await api.put(`/shopping-list/${itemId}`, { quantity, checked });
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['shoppingList'] });
      const previousList = queryClient.getQueryData<ShoppingListItem[]>(['shoppingList']);

      queryClient.setQueryData(['shoppingList'], (old: ShoppingListItem[] | undefined) => {
        if (!old) return [];
        return old.map((item) =>
          item._id === newItem.itemId ? { ...item, ...newItem } : item
        );
      });

      return { previousList };
    },
    onError: (err, newItem, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['shoppingList'], context.previousList);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Could not update item"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/shopping-list/${itemId}`);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['shoppingList'] });
      const previousList = queryClient.getQueryData<ShoppingListItem[]>(['shoppingList']);

      queryClient.setQueryData(['shoppingList'], (old: ShoppingListItem[] | undefined) => {
        if (!old) return [];
        return old.filter((item) => item._id !== itemId);
      });

      return { previousList };
    },
    onError: (err, itemId, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['shoppingList'], context.previousList);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Could not remove item"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    }
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/shopping-list/clear');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['shoppingList'] });
      const previousList = queryClient.getQueryData<ShoppingListItem[]>(['shoppingList']);

      queryClient.setQueryData(['shoppingList'], []);

      return { previousList };
    },
    onError: (err, vars, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(['shoppingList'], context.previousList);
      }
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Could not clear list"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    }
  });

  // Add to Pantry Logic
  const addToPantryMutation = useMutation({
    mutationFn: async (itemsToAdd: ShoppingListItem[]) => {
      const addedIds: string[] = [];

      // Execute sequentially to avoid backend concurrency issues (User document version conflicts)
      for (const item of itemsToAdd) {
        // Resolve ingredient ID
        const ingredientId = typeof item.ingredient === 'object' ? item.ingredient._id : item.ingredient;
        const ingredientUnit = typeof item.ingredient === 'object' ? item.ingredient.unit : item.unit;

        // Check if exists in pantry
        // Note: relying on the closure 'pantry' list which might be slightly stale if multiple unrelated updates happen,
        // but typically safe for this user-initiated action.
        const existingPantryItem = pantry.find((p: PantryItem) => {
          const pIngId = typeof p.ingredient === 'object' ? p.ingredient._id : p.ingredient;
          return pIngId === ingredientId;
        });

        try {
          if (existingPantryItem) {
            // Update quantity
            const newQty = existingPantryItem.quantity + item.quantity;
            await api.put(`/pantry/${existingPantryItem._id}`, { quantity: newQty });
          } else {
            // Add new
            await api.post("/pantry", {
              ingredientId,
              quantity: item.quantity,
              unit: ingredientUnit
            });
          }
          addedIds.push(item._id);
        } catch (error) {
          console.error(`Failed to add item ${item._id} to pantry`, error);
          // Continue with next item even if one fails
        }
      }

      if (addedIds.length === 0) {
        throw new Error("Failed to add any items");
      }

      return addedIds;
    },
    onSuccess: (addedIds) => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      updateAddedItems(addedIds);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Added ${addedIds.length} items to pantry`
      });
    },
    onError: (error) => {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Failed to add items to pantry"
      });
    }
  });

  const handleAddToPantry = () => {
    // Filter items that are checked AND not already added in this session
    const itemsToAdd = cart.filter((item: ShoppingListItem) => item.checked && !addedItems.has(item._id));

    if (itemsToAdd.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No items to add',
        text2: "Check items in your list first."
      });
      return;
    }

    showAlert(
      "Add to Pantry",
      `Add ${itemsToAdd.length} checked items to your pantry?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add to Pantry",
          onPress: () => addToPantryMutation.mutate(itemsToAdd)
        }
      ]
    );
  };

  // Helper functions
  const handleChangeQuantity = (item: ShoppingListItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      handleRemove(item._id);
    } else {
      updateMutation.mutate({ itemId: item._id, quantity: newQuantity });
    }
  };

  const handleToggleCheck = (item: ShoppingListItem) => {
    updateMutation.mutate({ itemId: item._id, checked: !item.checked });
  };

  const handleRemove = (itemId: string) => {
    showAlert("Remove", "Remove this item from shopping list?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeMutation.mutate(itemId) }
    ]);
  };

  const handleClearAll = () => {
    showAlert("Clear List", "Are you sure you want to remove all items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear All", style: "destructive", onPress: () => clearAllMutation.mutate() }
    ]);
  };

  const totalItems = cart.reduce((s: number, i: ShoppingListItem) => s + i.quantity, 0);

  const renderItem = ({ item, index }: { item: ShoppingListItem; index: number }) => {
    // Handle populated ingredient or fallback
    const name = typeof item.ingredient === 'object' ? item.ingredient.name : "Ingredient";
    const unit = typeof item.ingredient === 'object' ? item.ingredient.unit : item.unit;
    const category = typeof item.ingredient === 'object' ? item.ingredient.category : "Misc";
    const isAdded = addedItems.has(item._id);

    return (
      <Animated.View
        entering={FadeInDown.duration(300).springify().damping(20)}
        exiting={SlideOutRight}
        style={[
          styles.row,
          item.checked && styles.rowChecked,
          isAdded && styles.rowAdded
        ]}
      >
        <TouchableOpacity
          style={styles.checkArea}
          onPress={() => handleToggleCheck(item)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            item.checked && styles.checkboxChecked,
            isAdded && styles.checkboxAdded
          ]}>
            {item.checked && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.info}
          onPress={() => handleToggleCheck(item)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.name,
            item.checked && styles.textChecked,
            isAdded && styles.textAdded
          ]}>{name}</Text>
          <Text style={styles.meta}>
            {category ?? "Uncategorized"} · {unit ?? "unit"}
          </Text>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleChangeQuantity(item, -1)}
            disabled={updateMutation.isPending}
          >
            <Ionicons name="remove" size={16} color={COLORS.text.primary} />
          </TouchableOpacity>

          <Text style={[styles.qtyText, item.checked && { opacity: 0.5 }]}>{item.quantity}</Text>

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

  const renderSkeletons = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map(key => <ShoppingItemSkeleton key={key} />)}
    </View>
  );

  return (
    <View style={styles.container}>
      {cart.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleAddToPantry} style={styles.addToPantryBtn}>
            <Ionicons name="nutrition" size={18} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.addToPantryText}>Add to Pantry</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {isLoading && cart.length === 0 ? (
        renderSkeletons()
      ) : cart.length === 0 ? (
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/ingredients")}
      >
        <Ionicons name="add" size={28} color={COLORS.card} />
      </TouchableOpacity>

      <ConfirmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        actions={modalConfig.actions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  addButton: {
    position: 'absolute',
    bottom: SPACING.l,
    right: SPACING.l,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    zIndex: 100,
    elevation: 5
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
  headerActions: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToPantryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...SHADOWS.small
  },
  addToPantryText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.small,
    fontWeight: '600',
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
  rowChecked: {
    backgroundColor: COLORS.background, // Dimmed/different bg for checked
    opacity: 0.8,
  },
  rowAdded: {
    backgroundColor: '#ecfdf5', // Light green background (emerald-50)
    borderColor: COLORS.accent,
    borderWidth: 1,
    opacity: 0.6
  },
  checkArea: {
    padding: 4,
    marginRight: SPACING.s,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxAdded: {
    backgroundColor: COLORS.accent, // Green checkbox
    borderColor: COLORS.accent,
  },
  info: { flex: 1, marginRight: SPACING.m },
  name: { fontSize: FONTS.sizes.body, fontWeight: "600", color: COLORS.text.primary },
  textChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.text.secondary,
  },
  textAdded: {
    color: COLORS.accent,
    textDecorationLine: 'line-through'
  },
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
