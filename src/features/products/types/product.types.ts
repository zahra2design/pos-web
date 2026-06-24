import type { Product, ProductVariant, Category } from "@/types/database.types";

export interface ProductWithRelations extends Product {
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductFormData {
  name: string;
  sku: string;
  category_id: string;
  price: number;
  cost: number;
  image_url: string | null;
  is_active: boolean;
  is_available: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export interface VariantFormData {
  name: string;
  price_modifier: number;
  is_default: boolean;
}

export interface AddonFormData {
  name: string;
  price: number;
  category: string;
  is_active: boolean;
}
