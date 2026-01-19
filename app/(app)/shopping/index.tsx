import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
    Alert.alert("Eliminar", "¿Eliminar este ingrediente?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => removeMutation.mutate(itemId) }
    ]);
  };

  const totalItems = cart.reduce((s: number, i: ShoppingListItem) => s + i.quantity, 0);

  const renderItem = ({ item }: { item: ShoppingListItem }) => {
    // Handle populated ingredient or fallback
    const name = typeof item.ingredient === 'object' ? item.ingredient.name : "Ingrediente";
    const unit = typeof item.ingredient === 'object' ? item.ingredient.unit : item.unit;
    const category = typeof item.ingredient === 'object' ? item.ingredient.category : "Varios";

    return (
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {category ?? "Sin categoría"} · {unit ?? "unidad"}
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleChangeQuantity(item, -1)}
            disabled={updateMutation.isPending}
          >
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => handleChangeQuantity(item, 1)}
            disabled={updateMutation.isPending}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item._id)}
            disabled={removeMutation.isPending}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de la compra</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>Artículos: {cart.length}</Text>
        <Text style={styles.summaryText}>Total unidades: {totalItems}</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay ingredientes en la lista.</Text>
          <Button title="Ver ingredientes" onPress={() => router.push("/ingredients")} />
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#2c3e50", marginBottom: 12, textAlign: "center" },
  summary: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 6 },
  summaryText: { color: "#7f8c8d", fontSize: 14 },
  list: { paddingBottom: 20 },
  row: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eef6fb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600", color: "#2c3e50" },
  meta: { marginTop: 6, color: "#7f8c8d", fontSize: 13 },
  controls: { flexDirection: 'row', alignItems: "center" },
  qtyBtn: { width: 32, height: 32, borderRadius: 6, backgroundColor: "#ecf0f1", alignItems: "center", justifyContent: "center", marginHorizontal: 4 },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: "#2c3e50" },
  qtyText: { textAlign: "center", fontSize: 16, fontWeight: "600", minWidth: 24 },
  removeBtn: { marginLeft: 10, padding: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#7f8c8d", marginBottom: 12 },
});



