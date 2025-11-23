export interface Product {
  id: string;
  name: string;
  brand?: string;
  price: number;
  compare_price?: number;
  show_compare_price?: boolean;
  image?: string;
  category?: string;
  description?: string;
  notes?: string[];
  size?: string;
  stock_quantity: number;
  is_active: boolean;
  brand_id?: string;
  category_id?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  sku?: string;
  short_description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: Date;
  shipping_amount?: number;
}
