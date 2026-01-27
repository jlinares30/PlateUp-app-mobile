import { Stack } from "expo-router";

export default function RecipesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Recipes", headerShown: false }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Recipe Detail", headerShown: true }}
      />
      <Stack.Screen
        name="create"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
