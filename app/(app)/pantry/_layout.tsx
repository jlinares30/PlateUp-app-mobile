import { Stack } from "expo-router";

export default function PantryLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: "Pantry" }} />
            <Stack.Screen name="add" options={{ title: "Add Item" }} />
        </Stack>
    );
}   