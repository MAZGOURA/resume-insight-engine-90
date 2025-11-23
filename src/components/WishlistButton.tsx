import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "@/lib/database";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export const WishlistButton = ({
  productId,
  className,
  size = "default",
}: WishlistButtonProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isInWishlistState, setIsInWishlistState] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    if (!user) return;

    try {
      const inWishlist = await isInWishlist(user.id, productId);
      setIsInWishlistState(inWishlist);
    } catch (error) {
      console.error("Failed to check wishlist status:", error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error("Veuillez vous connecter pour ajouter des articles à votre liste d'envies");
      return;
    }

    setLoading(true);
    try {
      if (isInWishlistState) {
        await removeFromWishlist(user.id, productId);
        setIsInWishlistState(false);
        toast.success("Retiré de la liste d'envies");
      } else {
        await addToWishlist(user.id, productId);
        setIsInWishlistState(true);
        toast.success("Ajouté à la liste d'envies");
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Échec de la mise à jour de la liste d'envies");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleWishlist}
        disabled={loading}
        className={`${className} w-full text-xs gap-1.5`}
        aria-label={
          isInWishlistState ? "Retirer de la liste d'envies" : "Ajouter à la liste d'envies"
        }
        title={isInWishlistState ? "Retirer de la liste d'envies" : "Ajouter à la liste d'envies"}
      >
        <motion.div
          animate={{
            scale: isInWishlistState ? [1, 1.2, 1] : 1,
            rotate: isInWishlistState ? [0, 15, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              isInWishlistState
                ? "text-red-500 fill-red-500"
                : "text-muted-foreground"
            }`}
          />
        </motion.div>
        <span className="hidden sm:inline">{isInWishlistState ? 'Favori' : 'Favoris'}</span>
      </Button>
    </motion.div>
  );
};
