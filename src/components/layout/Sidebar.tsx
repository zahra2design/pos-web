import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_MENU_ACCESS, ROLE_LABELS, type Role } from "@/lib/constants/roles";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Monitor,
  Warehouse,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  Coffee,
  X,
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "products", label: "Produk", icon: Package, path: "/products" },
  { id: "pos", label: "POS", icon: ShoppingCart, path: "/pos" },
  { id: "kds", label: "Kitchen Display", icon: Monitor, path: "/kds" },
  { id: "inventory", label: "Inventory", icon: Warehouse, path: "/inventory" },
  { id: "customers", label: "Pelanggan", icon: Users, path: "/customers" },
  { id: "reports", label: "Laporan", icon: BarChart3, path: "/reports" },
  { id: "settings", label: "Pengaturan", icon: Settings, path: "/settings" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const allowedMenus = user ? ROLE_MENU_ACCESS[user.role] ?? [] : [];
  const filteredMenu = menuItems.filter((item) =>
    allowedMenus.includes(item.id)
  );

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose?.();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-screen flex-col border-r bg-muted/50 transition-all duration-300",
          // Desktop
          "hidden lg:flex",
          collapsed ? "lg:w-16" : "lg:w-64",
          // Mobile
          mobileOpen && "!fixed !inset-y-0 !left-0 !z-50 !flex w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <Coffee className="h-5 w-5" />
              <span className="font-semibold">CafePOS</span>
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="mx-auto">
              <Coffee className="h-5 w-5" />
            </Link>
          )}
          <div className="flex items-center gap-1">
            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="rounded p-1 hover:bg-accent lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
            {/* Desktop collapse button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded p-1 hover:bg-accent lg:block"
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {filteredMenu.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        {!collapsed && user && (
          <div className="border-t p-4">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">
              {ROLE_LABELS[user.role as Role] ?? user.role}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
