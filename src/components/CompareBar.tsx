import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale } from 'lucide-react';
import { Button } from './ui/button';
import { useComparison } from '@/contexts/ComparisonContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const CompareBar = () => {
  const { compareItems, removeFromComparison, clearComparison } = useComparison();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  if (compareItems.length === 0 || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 overflow-x-auto">
              <div className="flex items-center gap-2 shrink-0">
                <Scale className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  Comparer ({compareItems.length}/4)
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {compareItems.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="relative shrink-0 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-border bg-muted">
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeFromComparison(product.id)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={clearComparison}
              >
                Effacer tout
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/compare')}
                disabled={compareItems.length < 2}
              >
                Comparer maintenant
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
