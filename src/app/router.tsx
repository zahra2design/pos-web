import { createBrowserRouter, Navigate } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { ResetPasswordPage } from "@/features/auth/components/ResetPasswordPage";
import { DashboardPage } from "@/features/dashboard/components/DashboardPage";
import { ProductsPage } from "@/features/products/components/ProductsPage";
import { POSPage } from "@/features/pos/components/POSPage";
import { KDSPage } from "@/features/kds/components/KDSPage";
import { InventoryPage } from "@/features/inventory/components/InventoryPage";
import { CustomersPage } from "@/features/customers/components/CustomersPage";
import { ReportsPage } from "@/features/reports/components/ReportsPage";
import { SettingsPage } from "@/features/settings/components/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordForm />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "products",
        element: (
          <ProtectedRoute allowedRoles={["owner", "manager"]}>
            <ProductsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "pos",
        element: (
          <ProtectedRoute allowedRoles={["owner", "manager", "cashier"]}>
            <POSPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "kds",
        element: (
          <ProtectedRoute allowedRoles={["owner", "manager", "barista"]}>
            <KDSPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "inventory",
        element: (
          <ProtectedRoute
            allowedRoles={["owner", "manager", "inventory_staff"]}
          >
            <InventoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "customers",
        element: (
          <ProtectedRoute allowedRoles={["owner", "manager", "cashier"]}>
            <CustomersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute allowedRoles={["owner", "manager"]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={["owner"]}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
