import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "../services/auth.service";

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setLoading,
    logout: clearStore,
  } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        await authService.signIn(email, password);
        const profile = await authService.getCurrentUser();
        if (!profile) {
          throw new Error(
            "User profile not found. Please contact administrator."
          );
        }
        setUser(profile);
        navigate("/");
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [navigate, setUser, setLoading]
  );

  const logout = useCallback(async () => {
    await authService.signOut();
    clearStore();
    navigate("/login");
  }, [clearStore, navigate]);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    resetPassword,
  };
}
