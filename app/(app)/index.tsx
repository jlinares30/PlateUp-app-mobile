import MenuButton from "@/src/components/MenuButton";
import { COLORS, FONTS, SHADOWS, SPACING, useThemeColors } from "@/src/constants/theme";
import api from "@/src/lib/api";
import { TranslationKey, useTranslation } from "@/src/lib/i18n";
import { useAuthStore } from "@/src/store/useAuth";
import { useQuery } from '@tanstack/react-query';
import { Href, useRouter } from "expo-router";
import { Box, Calendar, ChefHat, Search, ShoppingBag, User as UserIcon } from "lucide-react-native";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

export default function AppHome() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t, language } = useTranslation();
  const { colors } = useThemeColors();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'es') {
      if (hour < 12) return "Buenos días";
      if (hour < 18) return "Buenas tardes";
      return "Buenas noches";
    }
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch Dashboard Stats
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data?.data ?? { recipesCount: 0, plansCount: 0, favoritesCount: 0 };
    },
    refetchOnMount: true
  });

  const menuItems = [
    {
      id: '1',
      titleKey: 'sidebar.recipes' as TranslationKey,
      description: language === 'es' ? 'Recetas y platillos' : 'Discover delicious meals',
      icon: <ChefHat size={28} color={COLORS.card} />,
      color: '#ef4444',
      route: '/recipes' as Href,
      delay: 50
    },
    {
      id: '4',
      titleKey: 'sidebar.mealPlans' as TranslationKey,
      description: language === 'es' ? 'Planifica tu semana' : 'Organize your week',
      icon: <Calendar size={28} color={COLORS.card} />,
      color: '#10b981',
      route: '/mealplans' as Href,
      delay: 100
    },
    {
      id: '5',
      titleKey: 'sidebar.shoppingList' as TranslationKey,
      description: language === 'es' ? 'Lista de supermercado' : 'Your grocery list',
      icon: <ShoppingBag size={28} color={COLORS.card} />,
      color: '#f59e0b',
      route: '/shopping' as Href,
      delay: 150
    },
    {
      id: '7',
      titleKey: 'sidebar.pantry' as TranslationKey,
      description: language === 'es' ? 'Tu inventario' : 'Manage inventory',
      icon: <Box size={28} color={COLORS.card} />,
      color: '#8b5cf6',
      route: '/pantry' as Href,
      delay: 200
    },
    {
      id: '6',
      titleKey: 'sidebar.ingredients' as TranslationKey,
      description: language === 'es' ? 'Catálogo completo' : 'Browse database',
      icon: <Search size={28} color={COLORS.card} />,
      color: '#3b82f6',
      route: '/ingredients' as Href,
      delay: 250
    },
    {
      id: '8',
      titleKey: 'sidebar.profile' as TranslationKey,
      description: language === 'es' ? 'Ajustes de cuenta' : 'Account settings',
      icon: <UserIcon size={28} color={COLORS.card} />,
      color: '#64748b',
      route: '/profile' as Href,
      delay: 300
    }
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <AnimatedView
      key={item.id}
      entering={FadeInDown.delay(item.delay).duration(400).springify().damping(18)}
      style={{ width: '48%', marginBottom: SPACING.m }}
    >
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: colors.card }]}
        onPress={() => router.push(item.route)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          {item.icon}
        </View>
        <Text style={[styles.menuTitle, { color: colors.text.primary }]}>{t(item.titleKey)}</Text>
        <Text style={[styles.menuDescription, { color: colors.text.secondary }]} numberOfLines={2}>{item.description}</Text>
      </TouchableOpacity>
    </AnimatedView>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ marginRight: SPACING.m }}>
          <MenuButton />
        </View>
        <AnimatedView entering={FadeInDown.duration(400)} style={styles.welcomeContainer}>
          <Text style={[styles.subtitleText, { color: colors.text.secondary }]}>{getGreeting()},</Text>
          <Text style={[styles.welcomeText, { color: colors.text.primary }]}>{user?.name || 'Chef'}!</Text>
        </AnimatedView>
        <AnimatedView entering={FadeInDown.delay(100).duration(400)}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            onPress={() => {
              router.push('/profile');
            }}
          >
            {
              user?.image ? (
                <Image
                  source={{ uri: user?.image }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={[styles.avatarText, { color: '#ffffff' }]}>{user?.name?.charAt(0)}</Text>
              )
            }
          </TouchableOpacity>
        </AnimatedView>
      </View>

      {/* Hero Section */}
      <AnimatedView entering={FadeInUp.delay(150).springify().damping(18)} style={[styles.heroSection, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
        <View style={styles.heroContent}>
          <Image
            source={require("@/assets/images/logo_plateup-removebg.png")}
            style={{ width: 60, height: 60, resizeMode: 'contain', marginBottom: SPACING.s, tintColor: colors.primary }}
          />
          <Text style={[styles.heroTitle, { color: colors.text.primary }]}>{t('dashboard.subtitle')}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.text.secondary }]}>{language === 'es' ? 'Encuentra la receta perfecta para hoy' : 'Find the perfect recipe for today'}</Text>
        </View>
      </AnimatedView>

      {/* Menu Grid */}
      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>{t('dashboard.menu')}</Text>
        <View style={styles.menuGrid}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Stats Quick View */}
      <AnimatedView entering={FadeInDown.delay(200).springify().damping(18)} style={[styles.statsContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.statItem} activeOpacity={0.8} onPress={() => router.push('/recipes/my-recipes')}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>{stats?.recipesCount ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t('sidebar.recipes')}</Text>
        </TouchableOpacity>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.statItem} activeOpacity={0.8} onPress={() => router.push('/recipes/my-recipes')}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats?.favoritesCount ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t('recipes.favorites')}</Text>
        </TouchableOpacity>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <TouchableOpacity style={styles.statItem} activeOpacity={0.8} onPress={() => router.push('/mealplans')}>
          <Text style={[styles.statNumber, { color: colors.secondary }]}>{stats?.plansCount ?? 0}</Text>
          <Text style={[styles.statLabel, { color: colors.text.secondary }]}>{t('sidebar.mealPlans')}</Text>
        </TouchableOpacity>
      </AnimatedView>
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
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: FONTS.sizes.h2,
    fontWeight: '700',
    color: COLORS.card,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: FONTS.sizes.body,
    color: COLORS.text.light,
    textAlign: 'center',
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
    textAlign: 'center',
  },
  statLabel: {
    fontSize: FONTS.sizes.small,
    color: COLORS.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
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
    paddingVertical: SPACING.m,
    paddingHorizontal: SPACING.s,
    alignItems: 'center',
    minHeight: 145,
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
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
    textAlign: 'center',
  },
  menuDescription: {
    fontSize: FONTS.sizes.tiny,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
});
