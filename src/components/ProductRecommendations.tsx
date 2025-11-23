import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { getRecommendedProducts } from '@/lib/recommendations';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface ProductRecommendationsProps {
  productId?: string;
  userId?: string;
  title?: string;
  limit?: number;
}

export const ProductRecommendations = ({
  productId,
  userId,
  title = 'Recommandations pour vous',
  limit = 4,
}: ProductRecommendationsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadRecommendations();
  }, [productId, userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recommendations = await getRecommendedProducts(userId, productId, limit + 2);
      setProducts(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(products.length - limit, prev + 1));
  };

  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Chargement des recommandations..." />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          {products.length > limit && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex >= products.length - limit}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            animate={{ x: -currentIndex * (100 / limit) + '%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
