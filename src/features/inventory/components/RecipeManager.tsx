import { useState, useEffect } from "react";
import {
  recipeService,
  ingredientService,
  type RecipeWithItems,
} from "../services/inventory.service";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Plus, Trash2, Loader2, ChefHat } from "lucide-react";
import type { Ingredient } from "@/types/database.types";

interface RecipeManagerProps {
  productId: string;
  productName: string;
}

export function RecipeManager({ productId, productName }: RecipeManagerProps) {
  const [recipe, setRecipe] = useState<RecipeWithItems | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [quantity, setQuantity] = useState("");

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipeData, ingredientsData] = await Promise.all([
        recipeService.getRecipeByProduct(productId),
        ingredientService.getIngredients(),
      ]);
      setRecipe(recipeData);
      setIngredients(ingredientsData.filter((i) => i.is_active));
    } catch (err) {
      console.error("Failed to load recipe:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecipe = async () => {
    const newRecipe = await recipeService.createRecipe(productId);
    setRecipe({ ...newRecipe, items: [] });
  };

  const handleAddItem = async () => {
    if (!recipe || !selectedIngredient || !quantity) return;
    const qty = parseFloat(quantity);
    if (qty <= 0) return;

    await recipeService.addRecipeItem(recipe.id, {
      ingredient_id: selectedIngredient,
      quantity: qty,
    });
    setSelectedIngredient("");
    setQuantity("");
    setShowAdd(false);
    await loadData();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Hapus item resep ini?")) return;
    await recipeService.deleteRecipeItem(itemId);
    await loadData();
  };

  const recipeCost =
    recipe?.items?.reduce((sum, item) => {
      const cost = item.ingredient?.cost_per_unit ?? 0;
      return sum + cost * item.quantity;
    }, 0) ?? 0;

  const availableIngredients = ingredients.filter(
    (i) => !recipe?.items?.some((ri) => ri.ingredient_id === i.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="space-y-4 rounded-lg border p-6 text-center">
        <ChefHat className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <div>
          <p className="font-medium">Belum ada resep untuk {productName}</p>
          <p className="text-sm text-muted-foreground">
            Buat resep untuk melacak penggunaan bahan baku
          </p>
        </div>
        <button
          onClick={handleCreateRecipe}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Buat Resep
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recipe Cost */}
      <div className="flex items-center justify-between rounded-lg bg-muted p-3">
        <span className="text-sm font-medium">Biaya Resep</span>
        <span className="text-lg font-bold text-primary">
          {formatCurrency(recipeCost)}
        </span>
      </div>

      {/* Recipe Items */}
      <div className="space-y-2">
        {recipe.items && recipe.items.length > 0 ? (
          recipe.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <span className="font-medium">
                  {item.ingredient?.name ?? "Unknown"}
                </span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {item.quantity} {item.ingredient?.unit}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {formatCurrency(
                    (item.ingredient?.cost_per_unit ?? 0) * item.quantity
                  )}
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="rounded p-1 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Resep kosong. Tambahkan bahan di bawah.
          </div>
        )}
      </div>

      {/* Add Item */}
      {showAdd ? (
        <div className="flex items-end gap-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium">Bahan</label>
            <select
              value={selectedIngredient}
              onChange={(e) => setSelectedIngredient(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Pilih bahan</option>
              {availableIngredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.unit})
                </option>
              ))}
            </select>
          </div>
          <div className="w-24 space-y-1">
            <label className="text-xs font-medium">Jumlah</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={handleAddItem}
            disabled={!selectedIngredient || !quantity}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Tambah
          </button>
          <button
            onClick={() => setShowAdd(false)}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Batal
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          disabled={availableIngredients.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Tambah Bahan ke Resep
        </button>
      )}
    </div>
  );
}
