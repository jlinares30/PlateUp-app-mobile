import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import MealPlanCard from "../../../src/components/MealPlanCard";
import api from "../../../src/lib/api";
// @ts-ignore
import { useAuthStore } from "../../../src/store/useAuth";

interface MealPlan {
  _id: string;
  title: string;
  description?: string;
  days?: number;
  ownerId?: string;
  owner?: string | { _id: string };
}

type Tab = 'my-plans' | 'discover';

export default function MealPlansScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('my-plans');
  const user = useAuthStore((state: any) => state.user);

  const [myPlans, setMyPlans] = useState<MealPlan[]>([]);
  const [publicPlans, setPublicPlans] = useState<MealPlan[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setError(null);
    try {
      // Fetch Public Plans
      const resPublic = await api.get("/meal-plans");
      const publicData = Array.isArray(resPublic.data?.data) ? resPublic.data?.data : (Array.isArray(resPublic.data) ? resPublic.data : []);

      // Fetch My Plans
      let myData: MealPlan[] = [];

      if (user && user._id) {
        try {
          // Strategy 1: strict /my endpoint
          const resMine = await api.get("/meal-plans/my");
          myData = Array.isArray(resMine.data?.data) ? resMine.data?.data : (Array.isArray(resMine.data) ? resMine.data : []);
        } catch (e) {
          console.log("/my endpoint failed, trying ?owner=ID");
          try {
            // Strategy 2: Filter by owner via query param
            const resOwner = await api.get(`/meal-plans`, { params: { owner: user._id } });
            const ownerData = Array.isArray(resOwner.data?.data) ? resOwner.data?.data : (Array.isArray(resOwner.data) ? resOwner.data : []);

            // client-side filter to be safe:
            myData = ownerData.filter((p: MealPlan) => {
              const o = typeof p.owner === 'object' ? (p.owner as any)._id : p.owner;
              return o === user._id || p.ownerId === user._id;
            });
          } catch (e2) {
            console.log("Query param failed, falling back to public list filter");
            // Strategy 3: Client-side filter of public list
            myData = publicData.filter((p: MealPlan) => {
              const ownerId = typeof p.owner === 'object' ? (p.owner as any)._id : p.owner;
              return ownerId === user._id || p.ownerId === user._id;
            });
          }
        }
      }

      setPublicPlans(publicData);
      setMyPlans(myData);

    } catch (err: any) {
      console.error("fetchData:", err);
      setError(err?.message ?? "Error loading plans");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]); // Add user dependency

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDuplicate = async (plan: MealPlan) => {
    try {
      Alert.alert("Duplicar Plan", `¿Deseas agregar "${plan.title}" a tus planes?`, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, agregar",
          onPress: async () => {
            const res = await api.post("/meal-plans/clone", { id: plan._id });
            const newPlan = res.data?.data ?? res.data;

            Alert.alert("Éxito", "Plan agregado a tu lista.");

            // Optimistic / Direct Update
            if (newPlan && newPlan._id) {
              setMyPlans(prev => [newPlan, ...prev]);
              setActiveTab('my-plans');
            } else {
              setActiveTab('my-plans');
              onRefresh();
            }
          }
        }
      ]);
    } catch (e) {
      console.error("Duplicate Error", e);
      Alert.alert("Error", "No se pudo duplicar el plan.");
    }
  };

  const handleEdit = (plan: MealPlan) => {
    router.push(`/mealplans/edit/${plan._id}`);
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
    }

    const data = activeTab === 'my-plans' ? myPlans : publicPlans;

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MealPlanCard
            item={item}
            onPress={() => router.push(`/mealplans/${item._id}`)}
            onAction={activeTab === 'discover' ? () => handleDuplicate(item) : () => handleEdit(item)}
            actionLabel={activeTab === 'discover' ? "Duplicar" : "Editar"}
            actionIcon={activeTab === 'discover' ? "copy-outline" : "create-outline"}
            actionColor={activeTab === 'discover' ? "#27ae60" : "#2980b9"}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'my-plans'
                ? "No tienes planes activos.\n¡Ve a Descubrir para añadir uno!"
                : "No hay planes públicos disponibles."}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Planes de Comida</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-plans' && styles.activeTab]}
          onPress={() => setActiveTab('my-plans')}
        >
          <Text style={[styles.tabText, activeTab === 'my-plans' && styles.activeTabText]}>Mis Planes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Descubrir</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
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
    fontSize: 28,
    fontWeight: "800",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "left"
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e6eef8',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontWeight: '600',
    color: '#7f8c8d',
    fontSize: 15,
  },
  activeTabText: {
    color: '#2980b9',
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 20
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: "center",
    color: "#95a5a6",
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 12
  },
});