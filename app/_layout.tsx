import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from "../src/store/useAuth.js";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Toast from 'react-native-toast-message';

const queryClient = new QueryClient();

export default function RootLayout() {

  const { user } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
