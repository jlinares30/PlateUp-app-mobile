import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from "../src/store/useAuth.js";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, token, _hasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const isAuthenticated = !!user && !!token;
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Esperar a que la navegación esté lista
  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState]);

  useEffect(() => {
    // CRÍTICO: No hacer NADA hasta que se haya hidratado Y la navegación esté lista
    if (!_hasHydrated || !isNavigationReady) {
      console.log("⏳ Waiting... hydrated:", _hasHydrated, "navReady:", isNavigationReady);
      return;
    }

    console.log("🔍 Checking auth:", { isAuthenticated, segments });

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      console.log("➡️ Redirecting to login");
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      console.log("➡️ Redirecting to app");
      router.replace('/(app)');
    }
  }, [isAuthenticated, segments, isNavigationReady, _hasHydrated]);

  // Mostrar loading mientras NO esté hidratado O la navegación no esté lista
  if (!_hasHydrated || !isNavigationReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2D3291" />
        <Text style={{ marginTop: 10, color: '#666' }}>
          {!_hasHydrated ? "Loading..." : "Starting..."}
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <RootLayoutNav />
      <Toast />
    </QueryClientProvider>
  );
}