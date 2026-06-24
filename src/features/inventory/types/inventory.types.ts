export interface IngredientFormData {
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  is_active: boolean;
}

export interface RecipeItemFormData {
  ingredient_id: string;
  quantity: number;
}

export interface StockInFormData {
  ingredient_id: string;
  quantity: number;
  cost_per_unit: number;
  supplier: string;
  notes: string;
}

export interface StockAdjustmentFormData {
  ingredient_id: string;
  quantity: number;
  reason: string;
  notes: string;
}
