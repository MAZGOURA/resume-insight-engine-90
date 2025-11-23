import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEventType = 'view' | 'cart_add' | 'purchase';

interface TrackEventParams {
  productId: string;
  eventType: AnalyticsEventType;
  metadata?: Record<string, any>;
}

// Get or create a session ID for anonymous tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

export const trackProductEvent = async ({
  productId,
  eventType,
  metadata = {}
}: TrackEventParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();

    await supabase.from('product_analytics').insert({
      product_id: productId,
      event_type: eventType,
      user_id: user?.id || null,
      session_id: sessionId,
      metadata
    });
  } catch (error) {
    console.error('Failed to track analytics event:', error);
    // Silently fail - analytics shouldn't break the user experience
  }
};

// Track product view
export const trackProductView = (productId: string) => {
  return trackProductEvent({ productId, eventType: 'view' });
};

// Track add to cart
export const trackAddToCart = (productId: string, quantity: number = 1) => {
  return trackProductEvent({ 
    productId, 
    eventType: 'cart_add',
    metadata: { quantity }
  });
};

// Track purchase
export const trackPurchase = (productId: string, orderId: string, quantity: number, price: number) => {
  return trackProductEvent({ 
    productId, 
    eventType: 'purchase',
    metadata: { order_id: orderId, quantity, price }
  });
};
