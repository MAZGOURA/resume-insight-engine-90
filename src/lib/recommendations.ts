import { supabase } from '@/integrations/supabase/client';
import { Product } from './types';

/**
 * Calcule le score de similarité entre deux produits
 */
export const calculateSimilarityScore = (product1: Product, product2: Product): number => {
  let score = 0;

  // Même catégorie (+0.3)
  if (product1.category_id === product2.category_id) {
    score += 0.3;
  }

  // Même marque (+0.1)
  if (product1.brand_id === product2.brand_id) {
    score += 0.1;
  }

  // Notes communes (+0.4 max)
  if (product1.notes && product2.notes && product1.notes.length > 0 && product2.notes.length > 0) {
    const commonNotes = product1.notes.filter((note) => product2.notes?.includes(note));
    const notesScore = (commonNotes.length / Math.max(product1.notes.length, product2.notes.length)) * 0.4;
    score += notesScore;
  }

  // Prix similaire (+0.2 max)
  const priceDiff = Math.abs(product1.price - product2.price);
  const avgPrice = (product1.price + product2.price) / 2;
  const priceScore = Math.max(0, 0.2 - (priceDiff / avgPrice) * 0.2);
  score += priceScore;

  return Math.min(1, Math.max(0, score));
};

/**
 * Récupère les produits recommandés basés sur l'historique et les similarités
 */
export const getRecommendedProducts = async (
  userId?: string,
  productId?: string,
  limit: number = 4
): Promise<Product[]> => {
  try {
    const recommendedProducts: Product[] = [];
    const seenIds = new Set<string>();

    // 1. Si productId fourni, chercher les produits similaires
    if (productId) {
      const { data: similarities } = await supabase
        .from('product_similarities')
        .select(`
          similar_product_id,
          similarity_score,
          products:similar_product_id (*)
        `)
        .eq('product_id', productId)
        .order('similarity_score', { ascending: false })
        .limit(limit);

      if (similarities) {
        similarities.forEach((sim: any) => {
          if (sim.products && !seenIds.has(sim.products.id)) {
            recommendedProducts.push(sim.products);
            seenIds.add(sim.products.id);
          }
        });
      }

      // Compléter avec des produits fréquemment achetés ensemble
      if (recommendedProducts.length < limit) {
        const frequentlyBought = await getFrequentlyBoughtTogether(productId, limit - recommendedProducts.length);
        frequentlyBought.forEach((p) => {
          if (!seenIds.has(p.id)) {
            recommendedProducts.push(p);
            seenIds.add(p.id);
          }
        });
      }
    }

    // 2. Si userId fourni, recommander basé sur l'historique
    if (userId && recommendedProducts.length < limit) {
      const { data: viewedProducts } = await supabase
        .from('product_views')
        .select('product_id')
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(5);

      if (viewedProducts && viewedProducts.length > 0) {
        const viewedIds = viewedProducts.map((v) => v.product_id);
        
        // Chercher des produits similaires aux produits vus
        const { data: similarToViewed } = await supabase
          .from('product_similarities')
          .select(`
            similar_product_id,
            similarity_score,
            products:similar_product_id (*)
          `)
          .in('product_id', viewedIds)
          .order('similarity_score', { ascending: false })
          .limit(limit);

        if (similarToViewed) {
          similarToViewed.forEach((sim: any) => {
            if (sim.products && !seenIds.has(sim.products.id) && recommendedProducts.length < limit) {
              recommendedProducts.push(sim.products);
              seenIds.add(sim.products.id);
            }
          });
        }
      }
    }

    // 3. Compléter avec des produits populaires si nécessaire
    if (recommendedProducts.length < limit) {
      const { data: popularProducts } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (popularProducts) {
        popularProducts.forEach((p) => {
          if (!seenIds.has(p.id) && recommendedProducts.length < limit) {
            recommendedProducts.push(p);
            seenIds.add(p.id);
          }
        });
      }
    }

    return recommendedProducts.slice(0, limit);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

/**
 * Trouve les produits fréquemment achetés ensemble
 */
export const getFrequentlyBoughtTogether = async (
  productId: string,
  limit: number = 3
): Promise<Product[]> => {
  try {
    // Trouver les commandes contenant ce produit
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('product_id', productId);

    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    const orderIds = orderItems.map((item) => item.order_id);

    // Trouver les autres produits dans ces commandes
    const { data: relatedItems } = await supabase
      .from('order_items')
      .select(`
        product_id,
        products (*)
      `)
      .in('order_id', orderIds)
      .neq('product_id', productId);

    if (!relatedItems) {
      return [];
    }

    // Compter les occurrences et trier
    const productCounts = new Map<string, { product: Product; count: number }>();

    relatedItems.forEach((item: any) => {
      if (item.products) {
        const existing = productCounts.get(item.product_id);
        if (existing) {
          existing.count++;
        } else {
          productCounts.set(item.product_id, { product: item.products, count: 1 });
        }
      }
    });

    // Trier par fréquence et retourner
    const sorted = Array.from(productCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => item.product);

    return sorted;
  } catch (error) {
    console.error('Error getting frequently bought together:', error);
    return [];
  }
};

/**
 * Enregistre une vue de produit
 */
export const trackProductView = async (productId: string, userId?: string) => {
  try {
    const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);

    await supabase.from('product_views').insert({
      product_id: productId,
      user_id: userId || null,
      session_id: sessionId,
    });
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

/**
 * Calcule et stocke les similarités pour un produit
 */
export const calculateAndStoreSimilarities = async (productId: string) => {
  try {
    const { data: currentProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!currentProduct) return;

    const { data: allProducts } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('id', productId);

    if (!allProducts) return;

    const similarities = allProducts
      .map((product) => ({
        product_id: productId,
        similar_product_id: product.id,
        similarity_score: calculateSimilarityScore(currentProduct, product),
      }))
      .filter((sim) => sim.similarity_score >= 0.3) // Garder seulement les similarités significatives
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, 10); // Top 10 produits similaires

    // Supprimer les anciennes similarités
    await supabase.from('product_similarities').delete().eq('product_id', productId);

    // Insérer les nouvelles
    if (similarities.length > 0) {
      await supabase.from('product_similarities').insert(similarities);
    }
  } catch (error) {
    console.error('Error calculating similarities:', error);
  }
};
