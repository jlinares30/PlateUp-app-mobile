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
        options={{ title: "Recipe Detail", headerShown: false }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{ title: "Edit Recipe", headerShown: false }}
      />
      <Stack.Screen
        name="my-recipes"
        options={{ title: "My Recipes", headerShown: false }}
      />
    </Stack>
  );
}
