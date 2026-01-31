import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from "../src/store/useAuth.js";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { user, token, _hasHydrated, setHasHydrated } = useAuthStore();
  const [forceHydrated, setForceHydrated] = useState(false);
  const isAuthenticated = !!user && !!token;

  // Timeout de seguridad: si no se hidrata en 3 segundos, forzar
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!_hasHydrated) {
        console.warn("⚠️ Hydration timeout - forcing hydration");
        setHasHydrated(true);
        setForceHydrated(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [_hasHydrated, setHasHydrated]);

  useEffect(() => {
    console.log("📊 Auth State:", {
      hasHydrated: _hasHydrated,
      forceHydrated,
      hasUser: !!user,
      hasToken: !!token,
      isAuthenticated
    });
  }, [_hasHydrated, forceHydrated, user, token, isAuthenticated]);

  // Mostrar loading mientras se hidrata
  if (!_hasHydrated && !forceHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2D3291" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
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