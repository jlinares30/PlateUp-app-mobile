import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../../src/lib/api";

interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
}

export default function IngredientsScreen() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = async () => {
    setError(null);
    try {
      const res = await api.get("/ingredients"); // ajusta endpoint si hace falta
      const data = res.data?.data ?? res.data;
      setIngredients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchIngredients:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Error al cargar ingredientes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIngredients();
  };

  const renderItem = ({ item }: { item: Ingredient }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`./ingredients/${item._id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>
          {item.category ?? "Sin categoría"} · {item.unit ?? "unidad"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingredientes</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={ingredients}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No hay ingredientes</Text>}
        contentContainerStyle={ingredients.length === 0 ? { flex: 1, justifyContent: "center" } : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: "700", color: "#2c3e50", marginBottom: 12, textAlign: "center" },
  row: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eef6fb",
  },
  info: { flexDirection: "column" },
  name: { fontSize: 16, fontWeight: "600", color: "#2c3e50" },
  meta: { marginTop: 6, color: "#7f8c8d", fontSize: 13 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { textAlign: "center", color: "#7f8c8d" },
  error: { color: "red", textAlign: "center", marginBottom: 12 },
});