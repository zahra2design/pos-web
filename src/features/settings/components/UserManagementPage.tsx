import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { userService, type UserWithOutlet } from "../services/user.service";
import { ROLE_LABELS, type Role } from "@/lib/constants/roles";
import { formatDate } from "@/lib/utils/format-date";
import {
  Users,
  Plus,
  Edit2,
  Search,
  Loader2,
  X,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

const createUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  role: z.enum(["owner", "manager", "cashier", "barista", "inventory_staff"]),
  outlet_id: z.string().nullable().optional(),
});

const editUserSchema = z.object({
  email: z.string().email("Email tidak valid").optional(),
  password: z.string().min(6, "Password minimal 6 karakter").optional(),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  role: z.enum(["owner", "manager", "cashier", "barista", "inventory_staff"]),
  outlet_id: z.string().nullable().optional(),
});

export function UserManagementPage() {
  const [users, setUsers] = useState<UserWithOutlet[]>([]);
  const [outlets, setOutlets] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithOutlet | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editingUser ? editUserSchema : createUserSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, outletsData] = await Promise.all([
        userService.getUsers(),
        userService.getOutlets(),
      ]);
      setUsers(usersData);
      setOutlets(outletsData);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    reset({ email: "", password: "", name: "", role: "cashier", outlet_id: outlets[0]?.id ?? null });
    setShowForm(true);
  };

  const handleOpenEdit = (user: UserWithOutlet) => {
    setEditingUser(user);
    reset({
      name: user.name,
      role: user.role,
      outlet_id: user.outlet_id,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          name: data.name as string,
          role: data.role as string,
          outlet_id: (data.outlet_id as string | null) ?? null,
        });
      } else {
        await userService.createUser({
          email: data.email as string,
          password: data.password as string,
          name: data.name as string,
          role: data.role as string,
          outlet_id: (data.outlet_id as string | null) ?? null,
        });
      }
      await loadData();
      handleCloseForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: UserWithOutlet) => {
    try {
      await userService.updateUser(user.id, {
        is_active: !user.is_active,
      });
      await loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengubah status";
      alert(message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.outlet_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      cashier: "bg-green-100 text-green-700",
      barista: "bg-orange-100 text-orange-700",
      inventory_staff: "bg-yellow-100 text-yellow-700",
    };
    return colors[role] ?? "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Manajemen User</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah User
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <p>
          User baru akan dibuat melalui Supabase Auth. Setelah dibuat, user bisa langsung login dengan email dan password yang diatur.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Nama
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Outlet
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Terdaftar
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {search
                      ? "Tidak ada user yang cocok"
                      : "Belum ada user terdaftar"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          <Shield className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                      >
                        {ROLE_LABELS[user.role as Role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.outlet_name ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <UserCheck className="h-4 w-4" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <UserX className="h-4 w-4" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="rounded-md p-1.5 hover:bg-accent"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`rounded-md p-1.5 ${
                            user.is_active
                              ? "text-red-500 hover:bg-red-50"
                              : "text-green-500 hover:bg-green-50"
                          }`}
                          title={user.is_active ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {user.is_active ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingUser ? "Edit User" : "Tambah User"}
              </h2>
              <button
                onClick={handleCloseForm}
                className="rounded-md p-1 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!editingUser && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      placeholder="email@contoh.com"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Nama</label>
                <input
                  type="text"
                  placeholder="Nama lengkap"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("role")}
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-xs text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Outlet</label>
                <select
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("outlet_id")}
                >
                  <option value="">Pilih Outlet</option>
                  {outlets.map((outlet) => (
                    <option key={outlet.id} value={outlet.id}>
                      {outlet.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
