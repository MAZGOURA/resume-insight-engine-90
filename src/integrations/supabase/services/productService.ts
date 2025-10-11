import { supabase } from "../client";
import type { Database } from "../types";
import type { Product as AppProduct } from "@/types/product";

export type SupabaseProduct = Database["public"]["Tables"]["products"]["Row"];

// Convert Supabase product to app product
export const toAppProduct = (product: SupabaseProduct): AppProduct => {
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    comparePrice: product.compare_price ? Number(product.compare_price) : undefined,
    costPrice: product.cost_price ? Number(product.cost_price) : undefined,
    category: "", // Will be populated separately if needed
    shortDescription: product.short_description || undefined,
    description: product.description || "",
    image: product.image_url || "",
    images: product.image_url ? [product.image_url] : [],
    notes: product.notes || [],
    size: product.size || "100ml",
    sku: product.sku || undefined,
    brand: "", // Will be populated separately if needed
    stockQuantity: product.stock_quantity || undefined,
    isActive: product.is_active,
    isFeatured: product.featured,
    rating: 4.5, // Default rating
    viewCount: product.view_count || undefined,
    createdAt: product.created_at || undefined,
    updatedAt: product.updated_at || undefined
  };
};

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<AppProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data.map(toAppProduct);
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 6): Promise<AppProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("featured", true)
      .limit(limit)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data.map(toAppProduct);
  },

  // Get product by ID
  getProductById: async (id: string): Promise<AppProduct> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    
    return toAppProduct(data);
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string): Promise<AppProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data.map(toAppProduct);
  },

  // Search products
  searchProducts: async (query: string): Promise<AppProduct[]> => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data.map(toAppProduct);
  }
};