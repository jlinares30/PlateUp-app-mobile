import { Stack } from "expo-router";

export default function IngredientsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Ingredients" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Ingredient Detail" }}
      />
    </Stack>
  );
}
