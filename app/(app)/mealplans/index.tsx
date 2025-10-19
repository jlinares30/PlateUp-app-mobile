import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import api from "../../../src/lib/api";

interface MealPlan {
  _id: string;
  title: string;
  description?: string;
  days?: number;
}

export default function MealPlansScreen() {
  const router = useRouter();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlans = async () => {
    setError(null);
    try {
      const res = await api.get("/meal-plans"); 
      const data = res.data?.data ?? res.data;
      setMealPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchMealPlans:", err);
      setError(err?.response?.data?.message ?? err.message ?? "Error al cargar meal plans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMealPlans();
  };

  const renderItem = ({ item }: { item: MealPlan }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => router.push(`./mealplans/${item._id}`)}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.title}</Text>
          {typeof item.days === "number" ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.days} días</Text>
            </View>
          ) : null}
        </View>
        {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
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
      <Text style={styles.headerTitle}>Planes de comida</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={mealPlans}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={<Text style={styles.empty}>No hay planes disponibles</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa", 
    paddingHorizontal: 16, 
    paddingTop: 20 
},
  headerTitle: { 
    fontSize: 26, 
    fontWeight: "700", 
    color: "#2c3e50", 
    marginBottom: 16, 
    textAlign: "center" 
},
  listContainer: { 
    paddingBottom: 20 
},
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  content: { 
    padding: 14 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 8 
},
  title: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#2c3e50", 
    flex: 1 
},
  badge: { 
    backgroundColor: "#e8f4fd", 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12 
  },
  badgeText: { 

    color: "#2980b9", 
    fontWeight: "500", 
    fontSize: 12 
  },
  description: { 
    color: "#7f8c8d", 
    fontSize: 14, 
    lineHeight: 20 
  },
  empty: { 
    textAlign: "center", color: "#7f8c8d", marginTop: 20 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
},

  error: { 
    color: "red", 
    textAlign: "center", 
    marginBottom: 12 
},
});