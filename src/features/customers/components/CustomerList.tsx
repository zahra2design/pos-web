import { useState, useEffect } from "react";
import { customerService } from "../services/customer.service";
import { CustomerForm } from "./CustomerForm";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/format-date";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Users,
  Eye,
} from "lucide-react";
import type { Customer } from "@/types/database.types";
import type { CustomerFormData } from "../services/customer.service";

const TIER_COLORS: Record<string, string> = {
  bronze: "bg-orange-100 text-orange-700",
  silver: "bg-gray-100 text-gray-700",
  gold: "bg-yellow-100 text-yellow-700",
};

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CustomerFormData) => {
    await customerService.createCustomer(data);
    await loadCustomers();
  };

  const handleUpdate = async (data: CustomerFormData) => {
    if (!editing) return;
    await customerService.updateCustomer(editing.id, data);
    await loadCustomers();
  };

  const handleDelete = async (c: Customer) => {
    if (!confirm(`Hapus pelanggan "${c.name}"?`)) return;
    await customerService.deleteCustomer(c.id);
    await loadCustomers();
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tambah Pelanggan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telepon</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Tier</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Poin</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Belanja</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Kunjungan</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Terakhir</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "Tidak ada pelanggan yang cocok" : "Belum ada pelanggan"}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${TIER_COLORS[c.loyalty_tier] ?? ""}`}>
                        {c.loyalty_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{c.loyalty_points}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(c.total_spending)}</td>
                    <td className="px-4 py-3 text-center">{c.total_visits}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.last_visit_at ? formatDate(c.last_visit_at) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewing(c)} className="rounded-md p-1.5 hover:bg-accent" title="Lihat">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setEditing(c); setShowForm(true); }} className="rounded-md p-1.5 hover:bg-accent" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(c)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50" title="Hapus">
                          <Trash2 className="h-4 w-4" />
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

      <CustomerForm
        open={showForm}
        onOpenChange={setShowForm}
        customer={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      {/* Customer Profile Dialog */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Profil Pelanggan</h2>
            <div className="space-y-3">
              <div><span className="text-sm text-muted-foreground">Nama:</span> <span className="font-medium">{viewing.name}</span></div>
              <div><span className="text-sm text-muted-foreground">Telepon:</span> <span>{viewing.phone}</span></div>
              <div><span className="text-sm text-muted-foreground">Email:</span> <span>{viewing.email || "-"}</span></div>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Tier</p>
                  <p className="font-bold capitalize">{viewing.loyalty_tier}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Poin</p>
                  <p className="font-bold">{viewing.loyalty_points}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Kunjungan</p>
                  <p className="font-bold">{viewing.total_visits}</p>
                </div>
              </div>
              <div><span className="text-sm text-muted-foreground">Total Belanja:</span> <span className="font-bold">{formatCurrency(viewing.total_spending)}</span></div>
              <div><span className="text-sm text-muted-foreground">Terakhir:</span> <span>{viewing.last_visit_at ? formatDate(viewing.last_visit_at) : "-"}</span></div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewing(null)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
