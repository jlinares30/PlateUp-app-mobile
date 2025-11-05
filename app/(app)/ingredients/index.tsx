import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import SwipeableIngredientItem from "../../../src/components/SwipeableIngredientItem";
import api from "../../../src/lib/api";

interface Ingredient {
  _id: string;
  name: string;
  category?: string;
  unit?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const THRESHOLD = SCREEN_WIDTH * 0.25;

export default function IngredientsScreen() {

  
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const debounceRef = useRef<number | null>(null);

  const fetchIngredients = async (q?: string) => {
    setError(null);
    if (q) setSearching(true);
    try {
      const res = await api.get("/ingredients", { params: q ? { query: q } : {} });
      //console.log("fetchIngredients query:", q, "response:", res.data);
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
    // cleanup on unmount
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // debounce search and call server
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // short-circuit: if empty query, fetch all (or keep previous list)
    debounceRef.current = setTimeout(() => {
      fetchIngredients(query.trim() ? query.trim() : undefined);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIngredients();
  };

  const handleAddToShoppingList = (item: Ingredient) => {
  console.log("ADD TO SHOPPING LIST:", item.name);
  // TODO: add to your state or DB
  };

  const renderItem = ({ item }: { item: Ingredient }) => (
    <SwipeableIngredientItem 
    item={item} 
    onPress={() => router.push(`./ingredients/${item._id}`)} 
    onAdd={handleAddToShoppingList} 
    />
    

    // <GestureDetector gesture={pan}>
    //   <Animated.View style={[styles.row, animatedStyle]}>
    //     <TouchableOpacity
    //       style={styles.row}
    //       onPress={() => router.push(`./ingredients/${item._id}`)}
    //       activeOpacity={0.8}
    //     >
    //       <View style={styles.info}>
    //         <Text style={styles.name}>{item.name}</Text>
    //         <Text style={styles.meta}>
    //           {item.category ?? "Sin categoría"} · {item.unit ?? "unidad"}
    //         </Text>
    //       </View>
    //     </TouchableOpacity>
    //   </Animated.View>
    // </GestureDetector>
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

        <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search ingredient..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        { (searching || refreshing) ? (
          <ActivityIndicator style={{ marginLeft: 8 }} />
        ) : null }
      </View>

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