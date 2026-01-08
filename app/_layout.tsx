import { Stack } from 'expo-router';
import { useAuthStore } from "../src/store/useAuth.js";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {

  const { user } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </QueryClientProvider>
  );
}
