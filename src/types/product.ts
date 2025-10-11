export interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  category: string;
  shortDescription?: string;
  description: string;
  image: string;
  images?: string[];
  notes: string[];
  size: string; // Can contain multiple sizes separated by commas
  sku?: string;
  brand?: string;
  stockQuantity?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  rating?: number;
  viewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  createdAt?: string;
}

export interface Inventory {
  id: string;
  productId: string;
  sku?: string;
  quantity: number;
  reservedQuantity?: number;
  reorderLevel?: number;
  maxStockLevel?: number;
  isTrackInventory?: boolean;
  isPreorder?: boolean;
  preorderReleaseDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressInfo {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber?: string;
  status: string;
  currency?: string;
  subtotal?: number;
  taxAmount?: number;
  shippingAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentStatus?: string;
  paymentMethod?: string;
  shippingAddress: AddressInfo;
  billingAddress?: AddressInfo;
  notes?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSnapshot {
  name: string;
  image: string;
  category: string;
  price: number;
  [key: string]: string | number | boolean | undefined;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  productSnapshot?: ProductSnapshot;
  createdAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
  addressType: 'shipping' | 'billing';
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentMetadata {
  [key: string]: string | number | boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod?: string;
  amount: number;
  currency?: string;
  status: string;
  transactionId?: string;
  paymentIntentId?: string;
  clientSecret?: string;
  metadata?: PaymentMetadata;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate?: string;
  status: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  currency?: string;
  notes?: string;
  pdfUrl?: string;
  sentAt?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt?: string;
}