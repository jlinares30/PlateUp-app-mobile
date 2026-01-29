import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import api from "../../../src/lib/api";
// @ts-ignore
import Skeleton from "@/src/components/Skeleton";
import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { useAuthStore } from "../../../src/store/useAuth";
import { MealPlan } from "../../../src/types";

type Tab = 'my-plans' | 'discover';

const MealPlanSkeleton = () => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={12} />
        <View style={{ flex: 1, marginLeft: SPACING.m, gap: 8 }}>
          <Skeleton width="70%" height={24} />
          <Skeleton width="40%" height={16} />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Skeleton width={60} height={24} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <Skeleton width={36} height={36} borderRadius={18} />
        </View>
      </View>
    </View>
  </View>
);

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
      return res.data?.data ?? res.data ?? [];
    },
    staleTime: 1000 * 60 * 5
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
      return res.data?.data ?? res.data ?? [];
    },
    enabled: !!user
  });

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
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Plan saved to 'My Plans'"
      });
      setActiveTab('my-plans');
    },
    onError: (error) => {
      console.error("Duplicate Error", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Could not duplicate plan."
      });
    }
  });

  // Mutation for deleting a plan
  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      await api.delete(`/meal-plans/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlans'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: "Plan deleted successfully"
      });
    },
    onError: (error) => {
      console.error("Delete Error", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: "Could not delete plan."
      });
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

  const renderItem = ({ item, index }: { item: MealPlan; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/mealplans/${item._id}`)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.m }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.description || 'No description provided'}</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.tag}>
              <Ionicons name="time-outline" size={14} color={COLORS.text.light} />
              <Text style={styles.tagText}>{item.days?.length || 0} days</Text>
            </View>

            <View style={styles.actions}>
              {activeTab === 'discover' ? (
                <TouchableOpacity onPress={() => handleDuplicate(item)} style={styles.actionButton}>
                  <Ionicons name="copy-outline" size={20} color={COLORS.secondary} />
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={() => router.push(`/mealplans/edit/${item._id}`)} style={[styles.actionButton, { marginRight: SPACING.s }]}>
                    <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionButton, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderContent = () => {
    if (isLoading && !isRefreshing) {
      return (
        <View style={styles.listContainer}>
          {[1, 2, 3].map((key) => <MealPlanSkeleton key={key} />)}
        </View>
      );
    }

    const data = activeTab === 'my-plans' ? myPlans : publicPlans;

    return (
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={64} color={COLORS.text.light} style={{ marginBottom: SPACING.m }} />
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
      <View style={styles.content}>
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

        {/* FAB for creating new plan */}
        {activeTab === 'my-plans' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push("/mealplans/create")}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.m,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
    zIndex: 10,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SPACING.l,
    padding: 4,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.s,
    borderRadius: SPACING.m,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontWeight: '600',
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.body,
  },
  activeTabText: {
    color: COLORS.card,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 20
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.l,
    marginBottom: SPACING.m,
    ...SHADOWS.small,
  },
  cardContent: {
    padding: SPACING.m,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10', // 10% opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.m,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: SPACING.s,
  },
  tagText: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.body,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.m,
    right: SPACING.m,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
    zIndex: 100,
  },
});