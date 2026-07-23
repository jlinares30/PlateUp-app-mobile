import { COLORS, FONTS, useThemeColors } from "@/src/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import MenuButton from "../../src/components/MenuButton";
import SidebarLayout from "../../src/components/SidebarLayout";
import { SidebarProvider } from "../../src/context/SidebarContext";
import { useTranslation } from "../../src/lib/i18n";

export default function AppLayout() {
  const { t } = useTranslation();
  const { colors } = useThemeColors();

  return (
    <SidebarProvider>
      <SidebarLayout>
        <Stack
          screenOptions={{
            headerLeft: () => <MenuButton />,
            headerStyle: { backgroundColor: colors.card },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontSize: FONTS.sizes.h3,
              color: colors.text.primary
            },
            headerTitleAlign: 'center',
            headerTintColor: colors.text.primary,
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="recipes" options={{ title: t('sidebar.recipes'), headerShown: true }} />
          <Stack.Screen name="mealplans" options={{ title: t('sidebar.mealPlans'), headerShown: true }} />
          <Stack.Screen name="shopping" options={{ title: t('sidebar.shoppingList'), headerShown: true }} />
          <Stack.Screen name="ingredients" options={{ title: t('sidebar.ingredients'), headerShown: true }} />
          <Stack.Screen name="pantry" options={{ title: t('sidebar.pantry'), headerShown: true }} />
          <Stack.Screen name="profile" options={{ title: t('sidebar.profile'), headerShown: true }} />
          <Stack.Screen name="settings/index" options={{ title: t('settings.title'), headerShown: true }} />
        </Stack>
      </SidebarLayout>
    </SidebarProvider>
  );
}
