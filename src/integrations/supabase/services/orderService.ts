import { supabase } from "../client";
import type { Database } from "../types";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];

// Define types for order creation
interface CreateOrderData {
  user_id?: string;
  order_number?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  currency?: string;
  subtotal: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  total_amount: number;
  shipping_address: Database["public"]["Tables"]["orders"]["Row"]["shipping_address"];
  billing_address?: Database["public"]["Tables"]["orders"]["Row"]["billing_address"];
  notes?: string | null;
}

interface CreateOrderItem {
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product_snapshot?: Database["public"]["Tables"]["order_items"]["Row"]["product_snapshot"];
}

interface CreatePaymentData {
  order_id: string;
  payment_method: string;
  amount: number;
  currency?: string;
  status?: string;
  transaction_id?: string | null;
  payment_intent_id?: string | null;
  client_secret?: string | null;
  metadata?: Database["public"]["Tables"]["payments"]["Row"]["metadata"];
}

interface UpdateOrderStatusData {
  status: string;
  payment_status?: string;
}

export const orderService = {
  // Create a new order
  async createOrder(orderData: CreateOrderData) {
    // Start a Supabase transaction
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: orderData.user_id,
        order_number: orderData.order_number,
        status: orderData.status || "pending",
        payment_status: orderData.payment_status || "pending",
        payment_method: orderData.payment_method,
        currency: orderData.currency || "USD",
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        shipping_amount: orderData.shipping_amount,
        discount_amount: orderData.discount_amount || 0,
        total_amount: orderData.total_amount,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        notes: orderData.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      throw error;
    }

    return data;
  },

  // Create order items
  async createOrderItems(orderItems: CreateOrderItem[]) {
    const { data, error } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select();

    if (error) {
      console.error("Error creating order items:", error);
      throw error;
    }

    return data;
  },

  // Create payment record
  async createPayment(paymentData: CreatePaymentData) {
    const { data, error } = await supabase
      .from("payments")
      .insert({
        order_id: paymentData.order_id,
        payment_method: paymentData.payment_method,
        amount: paymentData.amount,
        currency: paymentData.currency || "USD",
        status: paymentData.status || "pending",
        transaction_id: paymentData.transaction_id || null,
        payment_intent_id: paymentData.payment_intent_id || null,
        client_secret: paymentData.client_secret || null,
        metadata: paymentData.metadata || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating payment:", error);
      throw error;
    }

    return data;
  },

  // Get order by ID
  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(*),
        payments(*)
      `)
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order:", error);
      throw error;
    }

    return data;
  },

  // Get user orders
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }

    return data;
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string, paymentStatus?: string) {
    const updateData: Partial<Order> = { status };
    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      throw error;
    }

    return data;
  }
};