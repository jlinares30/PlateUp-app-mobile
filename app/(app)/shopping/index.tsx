import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

type Ingredient = {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
};

type CartItem = Ingredient & { quantity: number };

const STORAGE_KEY = "@shopping_cart";

export default function ShoppingCart() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setCart(raw ? (JSON.parse(raw) as CartItem[]) : []);
    } catch (err) {
      console.error("loadCart:", err);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCart = async (items: CartItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setCart(items);
    } catch (err) {
      console.error("saveCart:", err);
    }
  };

  const changeQty = (id: string, delta: number) => {
    if (!cart) return;
    const next = cart
      .map((it) => (it._id === id ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it))
      .filter(Boolean);
    saveCart(next);
  };

  const removeItem = (id: string) => {
    if (!cart) return;
    const next = cart.filter((it) => it._id !== id);
    saveCart(next);
  };

  const clearCart = () => {
    Alert.alert("Vaciar carrito", "¿Deseas vaciar el carrito?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Vaciar",
        style: "destructive",
        onPress: async () => {
          await saveCart([]);
        },
      },
    ]);
  };

  const checkout = async () => {
    if (!cart || cart.length === 0) {
      Alert.alert("Carrito vacío", "Añade ingredientes antes de continuar.");
      return;
    }
    setBusy(true);
    try {
      // Attempt to send shopping list to backend (adjust endpoint if needed)
      await api.post("/shopping-lists", { items: cart.map(({ _id, quantity }) => ({ ingredient: _id, quantity })) });
      Alert.alert("Lista enviada", "Tu lista de compra fue enviada correctamente.");
      await saveCart([]);
    } catch (err: any) {
      console.error("checkout:", err);
      Alert.alert("Error", err?.response?.data?.message ?? "No se pudo enviar la lista. Se guardará localmente.");
    } finally {
      setBusy(false);
    }
  };

  const totalItems = useMemo(() => (cart ? cart.reduce((s, i) => s + i.quantity, 0) : 0), [cart]);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.category ?? "Sin categoría"} · {item.unit ?? "unidad"}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item._id, -1)}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item._id, 1)}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item._id)}>
          <Text style={styles.removeText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading || cart === null) {
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
          <Text style={styles.emptyText}>No hay ingredientes en el carrito.</Text>
          <Button title="Ver ingredientes" onPress={() => router.push("/ingredients")} />
        </View>
      ) : (
        <>
          <FlatList data={cart} keyExtractor={(i) => i._id} renderItem={renderItem} contentContainerStyle={styles.list} />
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]} onPress={clearCart}>
              <Text style={styles.actionText}>Vaciar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#27ae60" }]} onPress={checkout} disabled={busy}>
              <Text style={styles.actionText}>{busy ? "Enviando..." : "Enviar lista"}</Text>
            </TouchableOpacity>
          </View>
        </>
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
  controls: { alignItems: "center", justifyContent: "center" },
  qtyBtn: { width: 32, height: 32, borderRadius: 6, backgroundColor: "#ecf0f1", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  qtyBtnText: { fontSize: 18, fontWeight: "700", color: "#2c3e50" },
  qtyText: { textAlign: "center", fontSize: 16, fontWeight: "600", marginBottom: 6 },
  removeBtn: { marginTop: 4 },
  removeText: { color: "#e74c3c", fontWeight: "600" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center", marginHorizontal: 6 },
  actionText: { color: "#fff", fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#7f8c8d", marginBottom: 12 },
});



