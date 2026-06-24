import { supabase } from "@/lib/supabase/client";
import type {
  Ingredient,
  Recipe,
  RecipeItem,
  InventoryTransaction,
} from "@/types/database.types";
import type {
  IngredientFormData,
  RecipeItemFormData,
  StockInFormData,
  StockAdjustmentFormData,
} from "../types/inventory.types";

export interface RecipeWithItems extends Recipe {
  items?: (RecipeItem & { ingredient?: Ingredient })[];
}

export interface TransactionWithIngredient extends InventoryTransaction {
  ingredient?: Ingredient;
}

export const ingredientService = {
  async getIngredients(): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as Ingredient[]) ?? [];
  },

  async getIngredient(id: string): Promise<Ingredient | null> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as Ingredient;
  },

  async createIngredient(input: IngredientFormData): Promise<Ingredient> {
    const { data, error } = await supabase
      .from("ingredients")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Ingredient;
  },

  async updateIngredient(
    id: string,
    input: Partial<IngredientFormData>
  ): Promise<void> {
    const { error } = await supabase
      .from("ingredients")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteIngredient(id: string): Promise<void> {
    const { error } = await supabase
      .from("ingredients")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  },

  async getLowStock(): Promise<Ingredient[]> {
    const { data, error } = await supabase
      .from("ingredients")
      .select("*")
      .eq("is_active", true)
      .lt("current_stock", "minimum_stock")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as Ingredient[]) ?? [];
  },
};

export const recipeService = {
  async getRecipeByProduct(productId: string): Promise<RecipeWithItems | null> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, items:recipe_items(*, ingredient:ingredients(*))")
      .eq("product_id", productId)
      .single();
    if (error) return null;
    return data as RecipeWithItems;
  },

  async createRecipe(productId: string): Promise<Recipe> {
    const { data, error } = await supabase
      .from("recipes")
      .insert({ product_id: productId })
      .select()
      .single();
    if (error) throw error;
    return data as Recipe;
  },

  async addRecipeItem(
    recipeId: string,
    input: RecipeItemFormData
  ): Promise<RecipeItem> {
    const { data, error } = await supabase
      .from("recipe_items")
      .insert({ ...input, recipe_id: recipeId })
      .select()
      .single();
    if (error) throw error;
    return data as RecipeItem;
  },

  async updateRecipeItem(
    id: string,
    input: Partial<RecipeItemFormData>
  ): Promise<void> {
    const { error } = await supabase
      .from("recipe_items")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteRecipeItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("recipe_items")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export const inventoryService = {
  async getTransactions(filters?: {
    type?: string;
    ingredientId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<TransactionWithIngredient[]> {
    let query = supabase
      .from("inventory_transactions")
      .select("*, ingredient:ingredients(*)")
      .order("created_at", { ascending: false });

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.ingredientId) {
      query = query.eq("ingredient_id", filters.ingredientId);
    }
    if (filters?.dateFrom) {
      query = query.gte("created_at", filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte("created_at", filters.dateTo + "T23:59:59");
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as TransactionWithIngredient[]) ?? [];
  },

  async stockIn(input: StockInFormData): Promise<void> {
    const ingredient = await ingredientService.getIngredient(
      input.ingredient_id
    );
    if (!ingredient) throw new Error("Bahan tidak ditemukan");

    const newStock = ingredient.current_stock + input.quantity;
    const newCost =
      input.cost_per_unit > 0 ? input.cost_per_unit : ingredient.cost_per_unit;

    await ingredientService.updateIngredient(input.ingredient_id, {
      current_stock: newStock,
      cost_per_unit: newCost,
    });

    await supabase.from("inventory_transactions").insert({
      ingredient_id: input.ingredient_id,
      type: "stock_in",
      quantity: input.quantity,
      notes: input.notes || `Stok masuk dari ${input.supplier || "supplier"}`,
    });
  },

  async adjustStock(input: StockAdjustmentFormData): Promise<void> {
    const ingredient = await ingredientService.getIngredient(
      input.ingredient_id
    );
    if (!ingredient) throw new Error("Bahan tidak ditemukan");

    const newStock = ingredient.current_stock + input.quantity;
    if (newStock < 0) throw new Error("Stok tidak boleh kurang dari 0");

    await ingredientService.updateIngredient(input.ingredient_id, {
      current_stock: newStock,
    });

    await supabase.from("inventory_transactions").insert({
      ingredient_id: input.ingredient_id,
      type: "adjustment",
      quantity: input.quantity,
      reason: input.reason,
      notes: input.notes,
    });
  },
};
