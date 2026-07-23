import ConfirmModal, { ModalAction } from '@/src/components/ConfirmModal';
import Skeleton from "@/src/components/Skeleton";
import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from 'react-native-toast-message';
import { formatQuantityAndUnit } from "@/src/lib/units";
import { usePreferencesStore } from "@/src/store/usePreferencesStore";
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

const GroupedShoppingItemRow = ({
  group,
  onToggleCheck,
  onChangeQuantity,
  onRemove,
  isUpdating,
  isAddedToPantry
}: {
  group: {
    ingredientId: string;
    name: string;
    items: ShoppingListItem[];
    checked: boolean;
  };
  onToggleCheck: (items: ShoppingListItem[]) => void;
  onChangeQuantity: (item: ShoppingListItem, newQty: number) => void;
  onRemove: (id: string) => void;
  isUpdating: boolean;
  isAddedToPantry: boolean;
}) => {
  const { measurementSystem } = usePreferencesStore();
  const { colors } = useThemeColors();
  const isServerChecked = group.items.every(i => i.checked);
  const [localChecked, setLocalChecked] = React.useState<boolean | null>(null);

  // Sync with server data changes when group items list actually changes
  React.useEffect(() => {
    setLocalChecked(null);
  }, [group.items]);

  const isGroupChecked = localChecked !== null ? localChecked : isServerChecked;

  const handleToggle = () => {
    const nextState = !isGroupChecked;
    setLocalChecked(nextState);
    onToggleCheck(group.items);
  };

  return (
    <View style={{ marginBottom: SPACING.s }}>
      <TouchableOpacity
        activeOpacity={0.9}
        delayPressIn={0}
        onPress={handleToggle}
        style={[
          styles.row,
          { backgroundColor: isGroupChecked ? colors.background : colors.card, borderColor: colors.border },
          isGroupChecked && styles.rowChecked,
          isAddedToPantry && styles.rowAdded // Apply green bg
        ]}
      >
        {/* Checkbox for the whole group */}
        <View style={styles.checkArea}>
          <View style={[
            styles.checkbox,
            { borderColor: colors.primary },
            isGroupChecked && { backgroundColor: colors.primary },
            isAddedToPantry && styles.checkboxAdded // Apply green checkbox
          ]}>
            {(isGroupChecked || isAddedToPantry) && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[
            styles.name,
            { color: colors.text.primary },
            isGroupChecked && [styles.textChecked, { color: colors.text.secondary }],
            isAddedToPantry && styles.textAdded // Apply green text strikethrough
          ]}>{group.name}</Text>

          {/* Variants List */}
          <View style={{ marginTop: 8, gap: 8 }}>
            {group.items.map((item, idx) => {
              const rawUnit = typeof item.ingredient === 'object' ? item.ingredient.unit : item.unit;
              const category = typeof item.ingredient === 'object' ? item.ingredient.category : "Misc";
              const formatted = formatQuantityAndUnit(item.quantity, item.unit || rawUnit, measurementSystem);

              return (
                <View key={item._id} style={[styles.variantRow, { borderTopColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.meta, { color: colors.text.secondary }]}>
                      {category ?? "Uncategorized"} · {formatted.unit || "unit"}
                    </Text>
                    {item.contributors && item.contributors.length > 0 && (
                      <View style={{ marginTop: 2 }}>
                        {item.contributors.map((contrib, cIdx) => {
                          const contribFormatted = formatQuantityAndUnit(contrib.quantity, contrib.unit, measurementSystem);
                          return (
                            <Text key={cIdx} style={{ fontSize: 10, color: colors.text.secondary }}>
                              {contribFormatted.quantity} {contribFormatted.unit || ''} (para {contrib.recipeTitle})
                            </Text>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  {/* Controls for this variant */}
                  <View style={styles.controls}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.background }]}
                      onPress={() => onChangeQuantity(item, item.quantity - 1)}
                      disabled={isUpdating || isAddedToPantry} // Disable if added
                    >
                      <Ionicons name="remove" size={14} color={colors.text.primary} />
                    </TouchableOpacity>

                    <Text style={[styles.qtyText, { color: colors.text.primary }]}>{formatted.quantity}</Text>

                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: colors.background }]}
                      onPress={() => onChangeQuantity(item, item.quantity + 1)}
                      disabled={isUpdating || isAddedToPantry}
                    >
                      <Ionicons name="add" size={14} color={colors.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => onRemove(item._id)}
                      disabled={isUpdating}
                    >
                      <Ionicons name="trash-outline" size={18} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

import { useTranslation } from "@/src/lib/i18n";

export default function ShoppingCart() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();

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
          const pIngId = (p.ingredient && typeof p.ingredient === 'object') ? p.ingredient._id : p.ingredient;
          return pIngId === ingredientId;
        });

        try {
          if (existingPantryItem) {
            // Update quantity and stock level to FULL
            const newQty = existingPantryItem.quantity + item.quantity;

            // Logic: If LOW/MEDIUM -> FULL. If FULL -> FULL.
            // So we can just set stockLevel to 'FULL' always when adding from shopping list.
            await api.put(`/pantry/${existingPantryItem._id}`, {
              quantity: newQty,
              stockLevel: 'FULL'
            });
          } else {
            // Add new with FULL stock
            await api.post("/pantry", {
              ingredientId,
              quantity: item.quantity,
              unit: ingredientUnit,
              stockLevel: 'FULL'
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
        text1: language === 'es' ? 'Sin elementos para agregar' : 'No items to add',
        text2: language === 'es' ? 'Marca elementos en tu lista primero.' : 'Check items in your list first.'
      });
      return;
    }

    showAlert(
      language === 'es' ? 'Agregar a la despensa' : 'Add to Pantry',
      language === 'es' ? `¿Deseas agregar ${itemsToAdd.length} elemento(s) marcados a tu despensa?` : `Add ${itemsToAdd.length} checked items to your pantry?`,
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: language === 'es' ? 'Agregar' : 'Add to Pantry',
          onPress: () => addToPantryMutation.mutate(itemsToAdd)
        }
      ]
    );
  };

  const handleRemove = useCallback((itemId: string) => {
    showAlert(
      language === 'es' ? 'Eliminar Elemento' : 'Remove Item',
      language === 'es' ? '¿Quitar este elemento de la lista de compras?' : 'Remove this item from shopping list?',
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('common.delete'), style: "destructive", onPress: () => removeMutation.mutate(itemId) }
      ]
    );
  }, [removeMutation, language, t]);

  // Helper functions
  const handleChangeQuantity = useCallback((item: ShoppingListItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemove(item._id);
    } else {
      updateMutation.mutate({ itemId: item._id, quantity: newQuantity });
    }
  }, [updateMutation, handleRemove]);

  const handleToggleCheck = useCallback((item: ShoppingListItem) => {
    updateMutation.mutate({ itemId: item._id, checked: !item.checked });
  }, [updateMutation]);

  const handleClearAll = () => {
    showAlert(
      language === 'es' ? 'Vaciar Lista' : 'Clear List',
      language === 'es' ? '¿Estás seguro de que deseas eliminar todos los elementos de la lista?' : 'Are you sure you want to remove all items?',
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: language === 'es' ? 'Vaciar Todo' : 'Clear All', style: "destructive", onPress: () => clearAllMutation.mutate() }
      ]
    );
  };

  const totalItems = cart.reduce((s: number, i: ShoppingListItem) => s + i.quantity, 0);

  /* Unused renderItem for flat list
  const renderItem = useCallback(({ item, index }: { item: ShoppingListItem; index: number }) => {
    return (
      <View />
    );
  }, []);
  */

  const renderSkeletons = () => (
    <View style={styles.list}>
      {[1, 2, 3, 4, 5].map(key => <ShoppingItemSkeleton key={key} />)}
    </View>
  );

  // Group items by ingredient ID
  const groupedCart = React.useMemo(() => {
    const groups: Record<string, { ingredientId: string; name: string; items: ShoppingListItem[]; checked: boolean }> = {};

    cart.forEach((item: ShoppingListItem) => {
      const ingId = typeof item.ingredient === 'object' ? item.ingredient._id : item.ingredient;
      const ingName = typeof item.ingredient === 'object' ? item.ingredient.name : "Unknown Ingredient";

      if (!groups[ingId]) {
        groups[ingId] = {
          ingredientId: ingId,
          name: ingName,
          items: [],
          checked: true // Start true, if any is false -> false
        };
      }

      groups[ingId].items.push(item);
      if (!item.checked) groups[ingId].checked = false;
    });

    return Object.values(groups);
  }, [cart]);

  const pendingSyncRef = React.useRef<Record<string, boolean>>({});
  const syncTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleGroup = useCallback((items: ShoppingListItem[]) => {
    const isAllChecked = items.every(i => i.checked);
    const newStatus = !isAllChecked;
    const targetIds = new Set(items.map(i => i._id));

    // 1. Respuesta visual INSTANTÁNEA (0ms de retraso) en la interfaz local
    queryClient.setQueryData<ShoppingListItem[]>(['shoppingList'], (old) => {
      if (!old) return [];
      return old.map(item => targetIds.has(item._id) ? { ...item, checked: newStatus } : item);
    });

    // 2. Acumular cambios en cola diferida
    items.forEach(item => {
      pendingSyncRef.current[item._id] = newStatus;
    });

    // 3. Enviar al servidor tras 800ms de inactividad
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(async () => {
      const itemsToSync = { ...pendingSyncRef.current };
      pendingSyncRef.current = {};

      try {
        await Promise.all(
          Object.entries(itemsToSync).map(([itemId, checked]) =>
            api.put(`/shopping-list/${itemId}`, { checked })
          )
        );
      } catch (e) {
        console.error("Debounced shopping list sync error:", e);
      }
    }, 800);
  }, [queryClient]);

  const renderGroup = useCallback(({ item }: { item: any }) => {
    // Check if any item in this group has been added to pantry
    const isAdded = item.items.some((i: ShoppingListItem) => addedItems.has(i._id));

    return (
      <GroupedShoppingItemRow
        group={item}
        onToggleCheck={handleToggleGroup}
        onChangeQuantity={handleChangeQuantity}
        onRemove={handleRemove}
        isUpdating={updateMutation.isPending || removeMutation.isPending}
        isAddedToPantry={isAdded}
      />
    );
  }, [handleToggleGroup, handleChangeQuantity, handleRemove, updateMutation.isPending, removeMutation.isPending, addedItems]);

  const { colors } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {cart.length > 0 && (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleAddToPantry} style={[styles.addToPantryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="nutrition" size={18} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.addToPantryText, { color: colors.primary }]}>{t('shopping.addToPantry')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={[styles.clearButtonText, { color: colors.error }]}>{t('shopping.clearAll')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.summary, { backgroundColor: colors.card }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>{cart.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Items</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.accent }]}>{cart.filter((i: ShoppingListItem) => i.checked).length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>{language === 'es' ? 'Listos' : 'Done'}</Text>
        </View>
      </View>

      {isLoading && cart.length === 0 ? (
        renderSkeletons()
      ) : cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={64} color={colors.text.light} style={{ marginBottom: SPACING.m }} />
          <Text style={[styles.emptyText, { color: colors.text.primary }]}>{t('shopping.emptyTitle')}</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/recipes')}>
            <Text style={[styles.emptyButtonText, { color: '#ffffff' }]}>{t('shopping.exploreRecipes')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={groupedCart}
          keyExtractor={(g) => g.ingredientId}
          renderItem={renderGroup}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/ingredients")}
      >
        <Ionicons name="add" size={28} color={colors.card} />
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
    bottom: 50,
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
  qtyInput: {
    textAlign: "center",
    fontSize: FONTS.sizes.body,
    fontWeight: "600",
    minWidth: 40,
    color: COLORS.text.primary,
    paddingHorizontal: 4,
    paddingVertical: 0,
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
  },
  variantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '50', // light border
    paddingTop: 8,
  },
  qtyText: {
    fontSize: FONTS.sizes.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginHorizontal: 8,
    minWidth: 20,
    textAlign: 'center'
  }
});
