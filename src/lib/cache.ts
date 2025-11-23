import { Product } from './types';

const CACHE_PREFIX = 'anas_';
const CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

/**
 * Cache un produit dans sessionStorage
 */
export const cacheProduct = (product: Product): void => {
  try {
    const cacheItem: CacheItem<Product> = {
      data: product,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(`${CACHE_PREFIX}product_${product.id}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to cache product:', error);
  }
};

/**
 * Récupère un produit depuis le cache
 */
export const getCachedProduct = (id: string): Product | null => {
  try {
    const cached = sessionStorage.getItem(`${CACHE_PREFIX}product_${id}`);
    if (!cached) return null;

    const cacheItem: CacheItem<Product> = JSON.parse(cached);
    
    // Vérifier si le cache est expiré
    if (Date.now() - cacheItem.timestamp > CACHE_EXPIRY) {
      sessionStorage.removeItem(`${CACHE_PREFIX}product_${id}`);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.warn('Failed to get cached product:', error);
    return null;
  }
};

/**
 * Cache une liste de produits
 */
export const cacheProducts = (products: Product[], key: string): void => {
  try {
    const cacheItem: CacheItem<Product[]> = {
      data: products,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(`${CACHE_PREFIX}products_${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.warn('Failed to cache products:', error);
  }
};

/**
 * Récupère une liste de produits depuis le cache
 */
export const getCachedProducts = (key: string): Product[] | null => {
  try {
    const cached = sessionStorage.getItem(`${CACHE_PREFIX}products_${key}`);
    if (!cached) return null;

    const cacheItem: CacheItem<Product[]> = JSON.parse(cached);
    
    // Vérifier si le cache est expiré
    if (Date.now() - cacheItem.timestamp > CACHE_EXPIRY) {
      sessionStorage.removeItem(`${CACHE_PREFIX}products_${key}`);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.warn('Failed to get cached products:', error);
    return null;
  }
};

/**
 * Nettoie le cache expiré
 */
export const cleanExpiredCache = (): void => {
  try {
    const keys = Object.keys(sessionStorage);
    const now = Date.now();

    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = sessionStorage.getItem(key);
          if (cached) {
            const cacheItem = JSON.parse(cached);
            if (now - cacheItem.timestamp > CACHE_EXPIRY) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Si on ne peut pas parser, supprimer
          sessionStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clean cache:', error);
  }
};

/**
 * Vide tout le cache
 */
export const clearCache = (): void => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};
