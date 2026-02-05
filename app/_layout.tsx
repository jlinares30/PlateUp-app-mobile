import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates'; // 1. Importamos Updates
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native'; // Añadimos Alert
import Toast from 'react-native-toast-message';
import { useAuthStore } from "../src/store/useAuth.js";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, token, _hasHydrated, setHasHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const isAuthenticated = !!user && !!token;
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // --- UPDATE LOGIC (OTA) ---
  useEffect(() => {
    async function onCheckUpdates() {
      if (__DEV__) return;

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();

          Alert.alert(
            '¡New version!',
            'There is an update available with improvements in PlateUp. Do you want to restart to apply it?',
            [
              { text: 'Later', style: 'cancel' },
              {
                text: 'Update',
                onPress: async () => {
                  await Updates.reloadAsync();
                }
              },
            ]
          );
        }
      } catch (error) {
        // Failed to check for updates (maybe no internet), ignore and continue
        console.log("Failed to check for updates:", error);
      }
    }

    onCheckUpdates();
  }, []);
  // ---------------------------------------

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!_hasHydrated) {
        console.warn("⚠️ Forcing hydration after timeout");
        setHasHydrated(true);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [_hasHydrated]);

  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState]);

  useEffect(() => {
    if (!_hasHydrated || !isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [isAuthenticated, segments, isNavigationReady, _hasHydrated]);

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
      <Toast position='bottom' bottomOffset={80} />
    </QueryClientProvider>
  );
}