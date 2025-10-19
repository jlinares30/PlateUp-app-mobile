import { Stack } from "expo-router";

export default function MealPlanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Meal Plans" }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: "Meal Plan Detail" }}
      />
    </Stack>
  );
}
