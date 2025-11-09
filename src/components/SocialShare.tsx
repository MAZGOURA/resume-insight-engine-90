import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Share2,
  Mail,
  MessageCircle,
  Copy,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  product?: {
    name: string;
    price: number;
    image: string;
  };
}

export const SocialShare = ({
  url = window.location.href,
  title = "ANAS FRAGRANCES - Luxury Perfumes",
  description = "Discover our exclusive collection of luxury perfumes and fragrances",
  image = "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1200&h=630&fit=crop",
  product,
}: SocialShareProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const shareText = product
    ? `Check out ${product.name} - $${product.price} at ANAS FRAGRANCES!`
    : title;

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(shareText);
  const shareDescription = encodeURIComponent(description);
  const shareImage = encodeURIComponent(image);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
    email: `mailto:?subject=${shareTitle}&body=${shareDescription}%0A%0A${url}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${url}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (platform === "instagram") {
      // For Instagram, we'll copy the text and image URL to clipboard
      navigator.clipboard.writeText(`${shareText}\n\n${url}`);
      toast.success("Text copied! You can now paste it on Instagram");
      return;
    }

    const shareWindow = window.open(
      shareLinks[platform],
      "share",
      "width=600,height=400,scrollbars=yes,resizable=yes"
    );

    if (shareWindow) {
      shareWindow.focus();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: description,
          url: url,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Native share button for mobile */}
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      )}

      {/* Social media buttons */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("facebook")}
        className="flex items-center gap-2"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("twitter")}
        className="flex items-center gap-2"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("instagram")}
        className="flex items-center gap-2"
        aria-label="Share on Instagram"
      >
        <Instagram className="h-4 w-4" />
        <span className="hidden sm:inline">Instagram</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("email")}
        className="flex items-center gap-2"
        aria-label="Share via Email"
      >
        <Mail className="h-4 w-4" />
        <span className="hidden sm:inline">Email</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare("whatsapp")}
        className="flex items-center gap-2"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="flex items-center gap-2"
        aria-label="Copy link"
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copy Link</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleLike}
        className={`flex items-center gap-2 ${isLiked ? "text-red-500" : ""}`}
        aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
      </Button>
    </div>
  );
};
