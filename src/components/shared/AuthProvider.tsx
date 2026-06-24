import { useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/features/auth/services/auth.service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, logout: clearStore } = useAuthStore();

  const fetchUser = useCallback(async () => {
    try {
      const profile = await authService.getCurrentUser();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setLoading(true);
      const session = await authService.getSession();
      if (session && mounted) {
        await fetchUser();
      } else if (mounted) {
        setLoading(false);
      }
    };
    initAuth();

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session) {
        await fetchUser();
      } else if (event === "SIGNED_OUT") {
        clearStore();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUser, clearStore, setLoading]);

  return <>{children}</>;
}
