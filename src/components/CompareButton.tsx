import { motion } from 'framer-motion';
import { Scale } from 'lucide-react';
import { Button } from './ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { Product } from '@/lib/types';

interface CompareButtonProps {
  product: Product;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const CompareButton = ({ 
  product, 
  variant = 'outline',
  size = 'sm' 
}: CompareButtonProps) => {
  const { isInComparison, addToComparison, removeFromComparison } = useComparison();
  const inComparison = isInComparison(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inComparison) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex-1"
    >
      <Button
        variant={inComparison ? 'default' : variant}
        size={size}
        onClick={handleClick}
        className="gap-1.5 w-full text-xs"
      >
        <Scale className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{inComparison ? 'En comparaison' : 'Comparer'}</span>
        <span className="sm:hidden"><Scale className="h-3.5 w-3.5" /></span>
      </Button>
    </motion.div>
  );
};
