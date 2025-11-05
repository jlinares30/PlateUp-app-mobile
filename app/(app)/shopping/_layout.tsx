import { Stack } from "expo-router/stack";

export default function ShoppingLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Shopping" }}
      />
        {/* <Stack.Screen
        name="[id]"
        options={{ title: "Shopping Detail" }}
        /> */}
    </Stack>
  );
}