import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type Language = 'en' | 'es';
export type MeasurementSystem = 'metric' | 'imperial';
export type ThemeMode = 'system' | 'light' | 'dark';

interface PreferencesState {
    language: Language;
    measurementSystem: MeasurementSystem;
    themeMode: ThemeMode;
    notificationsEnabled: boolean;
    setLanguage: (lang: Language) => void;
    setMeasurementSystem: (system: MeasurementSystem) => void;
    setThemeMode: (mode: ThemeMode) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            language: 'en',
            measurementSystem: 'metric',
            themeMode: 'system',
            notificationsEnabled: true,
            setLanguage: (language) => set({ language }),
            setMeasurementSystem: (measurementSystem) => set({ measurementSystem }),
            setThemeMode: (themeMode) => set({ themeMode }),
            setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
        }),
        {
            name: 'preferences-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
