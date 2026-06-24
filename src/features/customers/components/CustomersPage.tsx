import { Users } from "lucide-react";
import { CustomerList } from "./CustomerList";

export function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Pelanggan</h1>
      </div>
      <CustomerList />
    </div>
  );
}
