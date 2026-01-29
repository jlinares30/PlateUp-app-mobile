import MenuButton from "@/src/components/MenuButton";
import { COLORS, FONTS, SHADOWS, SPACING } from "@/src/constants/theme";
import { useAuthStore } from "@/src/store/useAuth";
import { Href, useRouter } from "expo-router";
import { Box, Calendar, ChefHat, Search, ShoppingBag, User as UserIcon } from "lucide-react-native";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function AppHome() {
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  }

  const menuItems = [
    {
      id: '1',
      title: 'Recipes',
      description: 'Discover delicious meals',
      icon: <ChefHat size={28} color={COLORS.card} />,
      color: '#ef4444',
      gradient: ['#ef4444', '#f87171'],
      route: '/recipes' as Href,
      delay: 50
    },
    {
      id: '4',
      title: 'Meal Plans',
      description: 'Organize your week',
      icon: <Calendar size={28} color={COLORS.card} />,
      color: '#10b981',
      gradient: ['#10b981', '#34d399'],
      route: '/mealplans' as Href,
      delay: 100
    },
    {
      id: '5',
      title: 'Shopping',
      description: 'Your grocery list',
      icon: <ShoppingBag size={28} color={COLORS.card} />,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fbbf24'],
      route: '/shopping' as Href,
      delay: 150
    },
    {
      id: '7',
      title: 'My Pantry',
      description: 'Manage inventory',
      icon: <Box size={28} color={COLORS.card} />,
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#a78bfa'],
      route: '/pantry' as Href,
      delay: 200
    },
    {
      id: '6',
      title: 'Ingredients',
      description: 'Browse database',
      icon: <Search size={28} color={COLORS.card} />,
      color: '#3b82f6',
      gradient: ['#3b82f6', '#60a5fa'],
      route: '/ingredients' as Href,
      delay: 250
    },
    {
      id: '8',
      title: 'Profile',
      description: 'Account settings',
      icon: <UserIcon size={28} color={COLORS.card} />,
      color: '#64748b',
      gradient: ['#64748b', '#94a3b8'],
      route: '/profile' as Href,
      delay: 300
    }
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(item.delay).duration(400).springify().damping(18)}
      style={{ width: '48%', marginBottom: SPACING.m }}
    >
      <TouchableOpacity
        style={[styles.menuItem]}
        onPress={() => router.push(item.route)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          {item.icon}
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription} numberOfLines={1}>{item.description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ marginRight: SPACING.m }}>
          <MenuButton />
        </View>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.welcomeContainer}>
          <Text style={styles.subtitleText}>Good Morning,</Text>
          <Text style={styles.welcomeText}>{user?.name || 'Chef'}!</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => {
              router.push('/profile');
            }}
          >
            <Text style={styles.avatarText}>{user?.image ? user?.image : user?.name?.charAt(0)}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Hero Section */}
      <Animated.View entering={FadeInUp.delay(150).springify().damping(18)} style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>What's cooking?</Text>
          <Text style={styles.heroSubtitle}>Find the perfect recipe for today</Text>
        </View>
      </Animated.View>

      {/* Menu Grid */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <View style={styles.menuGrid}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Stats Quick View */}
      <Animated.View entering={FadeInDown.delay(200).springify().damping(18)} style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} activeOpacity={0.8}>
          <Text style={[styles.statNumber, { color: COLORS.accent }]}>12</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} activeOpacity={0.8}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>5</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} activeOpacity={0.8}>
          <Text style={[styles.statNumber, { color: COLORS.secondary }]}>3</Text>
          <Text style={styles.statLabel}>Plans</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.xl * 1.5,
    paddingBottom: SPACING.l,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: FONTS.sizes.h1,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: FONTS.sizes.body,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  avatarText: {
    color: COLORS.card,
    fontSize: FONTS.sizes.h3,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    borderRadius: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small
  },
  logoutText: {
    color: COLORS.card,
    fontSize: FONTS.sizes.body,
    fontWeight: '600',
  },
  heroSection: {
    marginHorizontal: SPACING.l,
    borderRadius: SPACING.l,
    backgroundColor: COLORS.text.primary,
    padding: SPACING.l,
    marginBottom: SPACING.l,
    ...SHADOWS.large,
    shadowColor: COLORS.primary,
  },
  heroContent: {},
  heroTitle: {
    fontSize: FONTS.sizes.h2,
    fontWeight: '700',
    color: COLORS.card,
    marginBottom: SPACING.xs,
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.light,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.l,
    borderRadius: SPACING.m,
    padding: SPACING.m,
    marginBottom: SPACING.l,
    ...SHADOWS.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONTS.sizes.h2,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  menuSection: {
    paddingHorizontal: SPACING.l,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.m,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    backgroundColor: COLORS.card,
    borderRadius: SPACING.l,
    padding: SPACING.m,
    alignItems: 'center',
    height: 140,
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  menuTitle: {
    fontSize: FONTS.sizes.body,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: FONTS.sizes.tiny,
    color: COLORS.text.secondary,
  }
});
