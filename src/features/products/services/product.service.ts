import { supabase } from "@/lib/supabase/client";
import type { Category, Product, ProductVariant, Addon } from "@/types/database.types";
import type {
  ProductFormData,
  CategoryFormData,
  VariantFormData,
  AddonFormData,
  ProductWithRelations,
} from "../types/product.types";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) throw error;
    return (data as Category[]) ?? [];
  },

  async createCategory(input: CategoryFormData): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, input: Partial<CategoryFormData>): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  },
};

export const productService = {
  async getProducts(): Promise<ProductWithRelations[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as ProductWithRelations[]) ?? [];
  },

  async getProduct(id: string): Promise<ProductWithRelations | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .eq("id", id)
      .single();
    if (error) return null;
    return data as ProductWithRelations;
  },

  async createProduct(input: ProductFormData): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, input: Partial<ProductFormData>): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  },

  async uploadImage(file: File, productId: string): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `products/${productId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);
    return data.publicUrl;
  },

  async generateSku(categoryName: string): Promise<string> {
    const prefix = categoryName.substring(0, 3).toUpperCase();
    const { count, error } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .like("sku", `${prefix}-%`);
    if (error) throw error;
    const nextNum = (count ?? 0) + 1;
    return `${prefix}-${String(nextNum).padStart(3, "0")}`;
  },
};

export const variantService = {
  async getVariants(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("is_default", { ascending: false });
    if (error) throw error;
    return (data as ProductVariant[]) ?? [];
  },

  async createVariant(productId: string, input: VariantFormData): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from("product_variants")
      .insert({ ...input, product_id: productId })
      .select()
      .single();
    if (error) throw error;
    return data as ProductVariant;
  },

  async updateVariant(id: string, input: Partial<VariantFormData>): Promise<void> {
    const { error } = await supabase
      .from("product_variants")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteVariant(id: string): Promise<void> {
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};

export const addonService = {
  async getAddons(): Promise<Addon[]> {
    const { data, error } = await supabase
      .from("addons")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data as Addon[]) ?? [];
  },

  async createAddon(input: AddonFormData): Promise<Addon> {
    const { data, error } = await supabase
      .from("addons")
      .insert(input)
      .select()
      .single();
    if (error) throw error;
    return data as Addon;
  },

  async updateAddon(id: string, input: Partial<AddonFormData>): Promise<void> {
    const { error } = await supabase
      .from("addons")
      .update(input)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteAddon(id: string): Promise<void> {
    const { error } = await supabase
      .from("addons")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  },
};
