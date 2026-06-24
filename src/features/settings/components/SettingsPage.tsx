import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth.store";
import { UserManagementPage } from "./UserManagementPage";
import { outletService } from "../services/outlet.service";
import { Settings, Users, Store, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Outlet } from "@/types/database.types";

const tabs = [
  { id: "users", label: "User Management", icon: Users, roles: ["owner"] },
  { id: "outlet", label: "Outlet", icon: Store, roles: ["owner"] },
  { id: "roles", label: "Roles & Permissions", icon: Shield, roles: ["owner"] },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");
  const user = useAuthStore((s) => s.user);

  const allowedTabs = tabs.filter(
    (tab) => user && tab.roles.includes(user.role)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Pengaturan</h1>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {allowedTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "users" && <UserManagementPage />}
      {activeTab === "outlet" && <OutletSettings />}
      {activeTab === "roles" && <RolesInfo />}
    </div>
  );
}

const outletSchema = z.object({
  name: z.string().min(1, "Nama outlet wajib diisi"),
  address: z.string().optional(),
  phone: z.string().optional(),
  tax_rate: z.number().min(0).max(100),
  service_charge_rate: z.number().min(0).max(100),
  receipt_header: z.string().optional(),
  receipt_footer: z.string().optional(),
});

type OutletFormData = z.infer<typeof outletSchema>;

function OutletSettings() {
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(outletSchema),
  });

  useEffect(() => {
    loadOutlet();
  }, []);

  const loadOutlet = async () => {
    setLoading(true);
    try {
      const outlets = await outletService.getOutlets();
      if (outlets.length > 0) {
        const o = outlets[0];
        setOutlet(o);
        reset({
          name: o.name,
          address: o.address ?? "",
          phone: o.phone ?? "",
          tax_rate: o.tax_rate,
          service_charge_rate: o.service_charge_rate,
          receipt_header: o.receipt_header ?? "",
          receipt_footer: o.receipt_footer ?? "",
        });
      }
    } catch (err) {
      console.error("Failed to load outlet:", err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!outlet) return;
    setSaving(true);
    setSuccess(false);
    try {
      const formData = data as OutletFormData;
      await outletService.updateOutlet(outlet.id, {
        name: formData.name,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        tax_rate: formData.tax_rate,
        service_charge_rate: formData.service_charge_rate,
        receipt_header: formData.receipt_header || undefined,
        receipt_footer: formData.receipt_footer || undefined,
      });
      setSuccess(true);
      await loadOutlet();
    } catch (err) {
      console.error("Failed to update outlet:", err);
      alert("Gagal menyimpan pengaturan outlet");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        <Store className="mx-auto mb-4 h-12 w-12" />
        <p>Outlet tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          Pengaturan outlet berhasil disimpan.
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informasi Outlet</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Nama Outlet</label>
          <input
            type="text"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Alamat</label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={2}
            {...register("address")}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Telepon</label>
          <input
            type="text"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            {...register("phone")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pajak & Biaya</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">PPN (%)</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("tax_rate")}
            />
            {errors.tax_rate && (
              <p className="text-xs text-destructive">{errors.tax_rate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Service Charge (%)</label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("service_charge_rate")}
            />
            {errors.service_charge_rate && (
              <p className="text-xs text-destructive">{errors.service_charge_rate.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Struk</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">Header Struk</label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={2}
            placeholder="Teks di bagian atas struk"
            {...register("receipt_header")}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Footer Struk</label>
          <textarea
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={2}
            placeholder="Teks di bagian bawah struk (misal: Terima kasih atas kunjungan Anda!)"
            {...register("receipt_footer")}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Pengaturan
        </button>
      </div>
    </form>
  );
}

function RolesInfo() {
  const roleMatrix = [
    {
      module: "Dashboard",
      owner: true,
      manager: true,
      cashier: false,
      barista: false,
      inventory: false,
    },
    {
      module: "Produk",
      owner: true,
      manager: true,
      cashier: false,
      barista: false,
      inventory: false,
    },
    {
      module: "POS",
      owner: true,
      manager: true,
      cashier: true,
      barista: false,
      inventory: false,
    },
    {
      module: "Kitchen Display",
      owner: true,
      manager: true,
      cashier: false,
      barista: true,
      inventory: false,
    },
    {
      module: "Inventory",
      owner: true,
      manager: true,
      cashier: false,
      barista: false,
      inventory: true,
    },
    {
      module: "Pelanggan",
      owner: true,
      manager: true,
      cashier: true,
      barista: false,
      inventory: false,
    },
    {
      module: "Laporan",
      owner: true,
      manager: true,
      cashier: false,
      barista: false,
      inventory: false,
    },
    {
      module: "Pengaturan",
      owner: true,
      manager: false,
      cashier: false,
      barista: false,
      inventory: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Modul
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Owner
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Manager
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Kasir
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Barista
              </th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                Inventory
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {roleMatrix.map((row) => (
              <tr key={row.module}>
                <td className="px-4 py-2 font-medium">{row.module}</td>
                {(["owner", "manager", "cashier", "barista", "inventory"] as const).map(
                  (role) => (
                    <td key={role} className="px-4 py-2 text-center">
                      {row[role] ? (
                        <span className="text-green-500">&#10003;</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
