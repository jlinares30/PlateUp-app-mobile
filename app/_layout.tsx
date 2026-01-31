import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from "../src/store/useAuth.js";

import Toast from 'react-native-toast-message';

const queryClient = new QueryClient();

export default function RootLayout() {

  const { user, token, _hasHydrated } = useAuthStore();
  const isAuthenticated = !!user && !!token;

  if (!_hasHydrated) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#2D3291" />
    </View>
  );
}
// Temporalmente, añade un log para ver qué está pasando
console.log("Hydrated:", _hasHydrated);
console.log("User:", user);
console.log("Token:", token);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(app)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
      <Toast />
    </QueryClientProvider>
  );
}
