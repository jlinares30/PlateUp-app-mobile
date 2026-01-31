import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuth';

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Esperar a que zustand termine de hidratar
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      console.log("✅ Hydration finished via listener");
      setHydrated(true);
    });

    // Fallback: si no se hidrata en 2 segundos, forzar
    const timeout = setTimeout(() => {
      console.warn("⚠️ Forcing hydration after timeout");
      setHydrated(true);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return hydrated;
};