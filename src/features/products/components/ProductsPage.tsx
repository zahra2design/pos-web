import { useState } from "react";
import { Package, FolderOpen, Puzzle } from "lucide-react";
import { ProductList } from "./ProductList";
import { CategoryList } from "./CategoryList";
import { AddonList } from "./AddonList";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { id: "products", label: "Produk", icon: Package },
  { id: "categories", label: "Kategori", icon: FolderOpen },
  { id: "addons", label: "Addon", icon: Puzzle },
];

export function ProductsPage() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Produk</h1>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
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
      {activeTab === "products" && <ProductList />}
      {activeTab === "categories" && <CategoryList />}
      {activeTab === "addons" && <AddonList />}
    </div>
  );
}
