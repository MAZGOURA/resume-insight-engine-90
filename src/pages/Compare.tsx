import { motion } from 'framer-motion';
import { useComparison } from '@/contexts/ComparisonContext';
import { Button } from '@/components/ui/button';
import { X, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

export default function Compare() {
  const { compareItems, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (product: any) => {
    addToCart(product);
    toast({
      title: 'Produit ajouté au panier',
      description: `${product.name} a été ajouté à votre panier.`,
    });
  };

  if (compareItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <SEO
          title="Comparer les parfums"
          description="Comparez vos parfums préférés côte à côte"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold mb-4">Aucun produit à comparer</h1>
          <p className="text-muted-foreground mb-8">
            Ajoutez des produits à votre comparaison pour voir les différences
          </p>
          <Button onClick={() => navigate('/shop')}>
            Découvrir nos parfums
          </Button>
        </motion.div>
      </div>
    );
  }

  const comparisonRows = [
    { label: 'Image', key: 'image' },
    { label: 'Nom', key: 'name' },
    { label: 'Marque', key: 'brand' },
    { label: 'Prix', key: 'price' },
    { label: 'Catégorie', key: 'category' },
    { label: 'Taille', key: 'size' },
    { label: 'Notes olfactives', key: 'notes' },
    { label: 'Stock', key: 'stock' },
    { label: 'Description', key: 'description' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Comparaison de parfums"
        description="Comparez les caractéristiques de vos parfums préférés"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">
            Comparer les parfums ({compareItems.length})
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearComparison}>
              Effacer tout
            </Button>
            <Button variant="outline" onClick={() => navigate('/shop')}>
              Ajouter d'autres produits
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left sticky left-0 bg-background z-10 min-w-[200px]">
                  Caractéristiques
                </th>
                {compareItems.map((product, index) => (
                  <th key={product.id} className="p-4 min-w-[250px]">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromComparison(product.id)}
                        className="float-right"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, rowIndex) => (
                <motion.tr
                  key={row.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-4 font-semibold sticky left-0 bg-background z-10">
                    {row.label}
                  </td>
                  {compareItems.map((product) => (
                    <td key={`${product.id}-${row.key}`} className="p-4">
                      {row.key === 'image' && (
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={product.image_url || '/placeholder.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      {row.key === 'name' && (
                        <div className="font-semibold text-lg">{product.name}</div>
                      )}
                      {row.key === 'brand' && (
                        <div className="text-muted-foreground">{product.brand || 'N/A'}</div>
                      )}
                      {row.key === 'price' && (
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(product.price)}
                          </div>
                          {product.compare_price && product.show_compare_price && (
                            <div className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.compare_price)}
                            </div>
                          )}
                        </div>
                      )}
                      {row.key === 'category' && (
                        <Badge variant="secondary">{product.category || 'N/A'}</Badge>
                      )}
                      {row.key === 'size' && (
                        <div>{product.size || 'N/A'}</div>
                      )}
                      {row.key === 'notes' && (
                        <div className="flex flex-wrap gap-1">
                          {product.notes && product.notes.length > 0 ? (
                            product.notes.map((note, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {note}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      )}
                      {row.key === 'stock' && (
                        <div>
                          {product.stock_quantity > 0 ? (
                            <Badge variant="default" className="bg-green-500">
                              En stock ({product.stock_quantity})
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Rupture de stock</Badge>
                          )}
                        </div>
                      )}
                      {row.key === 'description' && (
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          {product.short_description || product.description || 'N/A'}
                        </div>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))}

              {/* Actions row */}
              <tr className="border-b border-border">
                <td className="p-4 font-semibold sticky left-0 bg-background z-10">
                  Actions
                </td>
                {compareItems.map((product, index) => (
                  <td key={product.id} className="p-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Ajouter au panier
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        Voir détails
                      </Button>
                    </motion.div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-muted-foreground text-sm"
        >
          <p>💡 Astuce : Vous pouvez comparer jusqu'à 4 produits en même temps</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
