import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_MENU_ACCESS } from "@/lib/constants/roles";
import type { Role } from "@/lib/constants/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to first allowed page for user's role
    const userMenus = ROLE_MENU_ACCESS[user.role as Role] ?? [];
    const firstMenu = userMenus[0];
    const redirectPath = firstMenu === "dashboard" ? "/" : `/${firstMenu}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
