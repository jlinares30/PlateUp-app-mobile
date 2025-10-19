import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="recipes" options={{ headerShown: false }} />
      <Stack.Screen name="mealplans" options={{ headerShown: false }} />
      <Stack.Screen name="ingredients" options={{ headerShown: false }} />
    </Stack>
  );
}
