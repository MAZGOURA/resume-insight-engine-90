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
      toast.error("Please sign in to add items to your wishlist");
      return;
    }

    setLoading(true);
    try {
      if (isInWishlistState) {
        await removeFromWishlist(user.id, productId);
        setIsInWishlistState(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(user.id, productId);
        setIsInWishlistState(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button
        variant="ghost"
        size={size}
        onClick={handleToggleWishlist}
        disabled={loading}
        className={className}
        aria-label={
          isInWishlistState ? "Remove from wishlist" : "Add to wishlist"
        }
        title={isInWishlistState ? "Remove from wishlist" : "Add to wishlist"}
      >
        <motion.div
          animate={{
            scale: isInWishlistState ? [1, 1.2, 1] : 1,
            rotate: isInWishlistState ? [0, 15, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`h-4 w-4 ${
              isInWishlistState
                ? "text-red-500 fill-red-500"
                : "text-muted-foreground"
            }`}
          />
        </motion.div>
      </Button>
    </motion.div>
  );
};
