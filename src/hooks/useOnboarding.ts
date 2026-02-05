import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useOnboarding(key: string) {
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const hasSeen = await AsyncStorage.getItem(key);
                if (!hasSeen) {
                    setShouldAnimate(true);
                    // Mark as seen immediately so it doesn't show again on reload
                    await AsyncStorage.setItem(key, 'true');
                }
            } catch (error) {
                console.error('Failed to check onboarding status:', error);
            }
        };

        checkOnboarding();
    }, [key]);

    return shouldAnimate;
}
