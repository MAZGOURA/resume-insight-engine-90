import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Google Analytics configuration
const GA_TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || "G-XXXXXXXXXX";

// Initialize Google Analytics
export const initializeAnalytics = () => {
  if (typeof window !== "undefined" && GA_TRACKING_ID) {
    // Load Google Analytics script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track e-commerce events
export const trackEcommerceEvent = (eventName: string, parameters: any) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters);
  }
};

// Track product views
export const trackProductView = (
  productId: string,
  productName: string,
  category: string,
  price: number
) => {
  trackEcommerceEvent("view_item", {
    currency: "USD",
    value: price,
    items: [
      {
        item_id: productId,
        item_name: productName,
        category: category,
        price: price,
        quantity: 1,
      },
    ],
  });
};

// Track add to cart
export const trackAddToCart = (
  productId: string,
  productName: string,
  category: string,
  price: number,
  quantity: number = 1
) => {
  trackEcommerceEvent("add_to_cart", {
    currency: "USD",
    value: price * quantity,
    items: [
      {
        item_id: productId,
        item_name: productName,
        category: category,
        price: price,
        quantity: quantity,
      },
    ],
  });
};

// Track purchase
export const trackPurchase = (
  transactionId: string,
  value: number,
  items: any[]
) => {
  trackEcommerceEvent("purchase", {
    transaction_id: transactionId,
    currency: "USD",
    value: value,
    items: items,
  });
};

// Track search
export const trackSearch = (searchTerm: string) => {
  trackEvent("search", "engagement", searchTerm);
};

// Track category filter
export const trackCategoryFilter = (category: string) => {
  trackEvent("filter", "engagement", category);
};

// Analytics Provider Component
export const AnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();

  useEffect(() => {
    initializeAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return <>{children}</>;
};

// Performance tracking
export const trackPerformance = () => {
  if (typeof window !== "undefined" && "performance" in window) {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation"
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        const metrics = {
          page_load_time: navigation.loadEventEnd - navigation.loadEventStart,
          dom_content_loaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          first_paint:
            paint.find((entry) => entry.name === "first-paint")?.startTime || 0,
          first_contentful_paint:
            paint.find((entry) => entry.name === "first-contentful-paint")
              ?.startTime || 0,
        };

        trackEvent(
          "performance",
          "timing",
          "page_load",
          Math.round(metrics.page_load_time)
        );
        trackEvent(
          "performance",
          "timing",
          "dom_content_loaded",
          Math.round(metrics.dom_content_loaded)
        );
        trackEvent(
          "performance",
          "timing",
          "first_paint",
          Math.round(metrics.first_paint)
        );
        trackEvent(
          "performance",
          "timing",
          "first_contentful_paint",
          Math.round(metrics.first_contentful_paint)
        );
      }, 0);
    });
  }
};

// Declare global gtag function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
