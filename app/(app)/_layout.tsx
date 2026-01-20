import { COLORS, FONTS } from "@/src/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import MenuButton from "../../src/components/MenuButton";
import SidebarLayout from "../../src/components/SidebarLayout";
import { SidebarProvider } from "../../src/context/SidebarContext";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <SidebarLayout>
        <Stack
          screenOptions={{
            headerLeft: () => <MenuButton />,
            headerStyle: { backgroundColor: COLORS.card },
            headerShadowVisible: false,
            headerTitleStyle: {
              fontSize: FONTS.sizes.h3,
              color: COLORS.text.primary
            },
            headerTitleAlign: 'center',
            headerTintColor: COLORS.text.primary,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="recipes" options={{ title: "Recipes", headerShown: true }} />
          <Stack.Screen name="mealplans" options={{ title: "Meal Plans", headerShown: true }} />
          <Stack.Screen name="shopping" options={{ title: "Shopping List", headerShown: true }} />
          <Stack.Screen name="ingredients" options={{ title: "Ingredients", headerShown: true }} />
          <Stack.Screen name="pantry" options={{ title: "Pantry", headerShown: true }} />
          <Stack.Screen name="profile" options={{ title: "Profile", headerShown: true }} />
        </Stack>
      </SidebarLayout>
    </SidebarProvider>
  );
}
