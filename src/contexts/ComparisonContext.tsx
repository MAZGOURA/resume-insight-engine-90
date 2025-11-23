import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

interface ComparisonContextType {
  compareItems: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'anas_comparison_items';

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [compareItems, setCompareItems] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareItems));
    } catch (error) {
      console.error('Failed to save comparison items:', error);
    }
  }, [compareItems]);

  const addToComparison = (product: Product) => {
    if (compareItems.find((item) => item.id === product.id)) {
      toast({
        title: 'Déjà en comparaison',
        description: 'Ce produit est déjà dans votre liste de comparaison.',
        variant: 'default',
      });
      return;
    }

    if (compareItems.length >= MAX_COMPARE_ITEMS) {
      toast({
        title: 'Limite atteinte',
        description: `Vous pouvez comparer maximum ${MAX_COMPARE_ITEMS} produits à la fois.`,
        variant: 'destructive',
      });
      return;
    }

    setCompareItems([...compareItems, product]);
    toast({
      title: 'Produit ajouté',
      description: 'Le produit a été ajouté à votre comparaison.',
    });
  };

  const removeFromComparison = (productId: string) => {
    setCompareItems(compareItems.filter((item) => item.id !== productId));
    toast({
      title: 'Produit retiré',
      description: 'Le produit a été retiré de votre comparaison.',
    });
  };

  const clearComparison = () => {
    setCompareItems([]);
    toast({
      title: 'Comparaison effacée',
      description: 'Tous les produits ont été retirés de la comparaison.',
    });
  };

  const isInComparison = (productId: string) => {
    return compareItems.some((item) => item.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareItems,
        addToComparison,
        removeFromComparison,
        clearComparison,
        isInComparison,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};
