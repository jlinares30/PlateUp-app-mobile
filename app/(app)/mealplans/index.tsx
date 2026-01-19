import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

import { MealPlan } from "../../../src/types";

type Tab = 'my-plans' | 'discover';

export default function MealPlansScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('my-plans');
  const user = useAuthStore((state: any) => state.user);
  const queryClient = useQueryClient();

  // 1. Query for Public Plans
  const {
    data: publicPlans = [],
    isLoading: loadingPublic,
    refetch: refetchPublic,
    isRefetching: refetchingPublic
  } = useQuery({
    queryKey: ['mealPlans', 'public'],
    queryFn: async () => {
      const res = await api.get("/meal-plans");
      console.log("Respuesta de API (Discover):", res.data);
      return res.data?.data ?? res.data ?? [];
    }
  });

  // 2. Query for My Plans
  const {
    data: myPlans = [],
    isLoading: loadingMy,
    refetch: refetchMy,
    isRefetching: refetchingMy
  } = useQuery({
    queryKey: ['mealPlans', 'my', user],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/meal-plans/my");
      console.log("Respuesta de API (Mis Planes):", res.data);
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!user
  });

  useEffect(() => {
    console.log("Estado actual del usuario:", user);
    console.log("¿ID de usuario disponible?:", !!user);
  }, [user]);

  // Derived state
  const isLoading = loadingPublic || loadingMy;
  const isRefreshing = refetchingPublic || refetchingMy;

  // Mutation for duplicating a plan
  const duplicateMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await api.post("/meal-plans/clone", { id: planId });
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      // Invalidate 'my' plans to trigger auto-refresh
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      Alert.alert("Success", "Plan saved to 'My Plans'");
      setActiveTab('my-plans');
    },
    onError: (error) => {
      console.error("Duplicate Error", error);
      Alert.alert("Error", "Could not duplicate plan.");
    }
  });


  // Mutation for deleting a plan
  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      // Assuming DELETE /meal-plans/:id is supported
      await api.delete(`/meal-plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      Alert.alert("Deleted", "Meal plan deleted successfully");
    },
    onError: (error) => {
      console.error("Delete Error", error);
      Alert.alert("Error", "Could not delete plan.");
    }
  });

  const onRefresh = () => {
    refetchPublic();
    if (user?._id) refetchMy();
  };

  const handleDuplicate = (plan: MealPlan) => {
    Alert.alert("Duplicate Plan", `Do you want to add "${plan.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, add it",
        onPress: () => duplicateMutation.mutate(plan._id)
      }
    ]);
  };

  const handleDelete = (plan: MealPlan) => {
    Alert.alert("Delete Plan", `Are you sure you want to delete "${plan.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: 'destructive', onPress: () => deleteMutation.mutate(plan._id) }
    ]);
  }

  const handleEdit = (plan: MealPlan) => {
    router.push(`/mealplans/edit/${plan._id}`);
  };

  const renderContent = () => {
    if (isLoading && !isRefreshing) {
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
            actionLabel={activeTab === 'discover' ? "Duplicate" : "Edit"}
            actionIcon={activeTab === 'discover' ? "copy-outline" : "create-outline"}
            actionColor={activeTab === 'discover' ? "#27ae60" : "#2980b9"}
            onDelete={activeTab === 'my-plans' ? () => handleDelete(item) : undefined}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'my-plans'
                ? "You don't have any active plans.\nGo to Discover to add one!"
                : "No public plans available."}
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Meal Plans</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-plans' && styles.activeTab]}
          onPress={() => setActiveTab('my-plans')}
        >
          <Text style={[styles.tabText, activeTab === 'my-plans' && styles.activeTabText]}>My Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>Discover</Text>
        </TouchableOpacity>
      </View>

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