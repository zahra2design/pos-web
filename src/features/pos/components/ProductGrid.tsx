import { useCartStore } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/utils/format-currency";
import { Package, Loader2 } from "lucide-react";
import type { ProductWithRelations } from "@/features/products/types/product.types";

interface ProductGridProps {
  products: ProductWithRelations[];
  loading: boolean;
}

export function ProductGrid({ products, loading }: ProductGridProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: ProductWithRelations) => {
    const defaultVariant = product.variants?.find((v) => v.is_default);
    const variantId = defaultVariant?.id ?? null;
    const variantName = defaultVariant?.name ?? null;
    const priceModifier = defaultVariant?.price_modifier ?? 0;

    addItem({
      product_id: product.id,
      product_name: product.name,
      variant_id: variantId,
      variant_name: variantName,
      price: product.price + priceModifier,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="mb-4 h-12 w-12" />
        <p>Tidak ada produk tersedia</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => {
        const defaultVariant = product.variants?.find((v) => v.is_default);
        const displayPrice =
          product.price + (defaultVariant?.price_modifier ?? 0);

        return (
          <button
            key={product.id}
            onClick={() => handleAddToCart(product)}
            className="group flex flex-col overflow-hidden rounded-lg border bg-card text-left transition-all hover:shadow-md active:scale-[0.98]"
          >
            {/* Image */}
            <div className="aspect-square bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-2.5">
              <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                {product.name}
              </h3>
              {product.variants && product.variants.length > 0 && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {product.variants.map((v) => v.name).join(" / ")}
                </p>
              )}
              <p className="mt-auto pt-1.5 text-sm font-bold text-primary">
                {formatCurrency(displayPrice)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
