import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from "../src/store/useAuth.js";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { user, token, _hasHydrated } = useAuthStore();
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    console.log("Auth State Changed:", {
      hasHydrated: _hasHydrated,
      hasUser: !!user,
      hasToken: !!token,
      isAuthenticated
    });
  }, [_hasHydrated, user, token, isAuthenticated]);

  // Mostrar loading mientras se hidrata
  if (!_hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2D3291" />
      </View>
    );
  }

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