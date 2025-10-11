import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Star, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <Card className="group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 animate-scale-in rounded-2xl border-0 bg-white">
      <div className="relative">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-[2/3] overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100">
            <img
              src={product.image}
              alt={`${product.name} - ${product.category} perfume`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
          <Star className="h-3 w-3 mr-1 fill-current" />
          4.8
        </div>
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
          NEW
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <span className="text-xs font-medium text-amber-600 uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif text-lg font-semibold mb-2 hover:text-amber-700 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex flex-wrap gap-1 mb-3">
          {product.notes.slice(0, 3).map((note, index) => (
            <span
              key={index}
              className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full"
            >
              {note}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[40px]">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-amber-900">
              ${product.price}
            </span>
            <span className="text-sm text-muted-foreground line-through ml-2">
              $299
            </span>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full h-10 px-3 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          className="w-full rounded-full border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={() => addToCart(product)}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};
