import { Helmet } from "react-helmet-async";
import { Product } from "@/lib/types";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "product" | "article";
  product?: Product;
  structuredData?: Record<string, unknown>;
}

export const SEO = ({
  title = "ANAS FRAGRANCES - Luxury Perfumes & Fragrances",
  description = "Discover our exclusive collection of luxury perfumes and fragrances. Premium scents for men, women, and unisex. Free shipping on orders over $100.",
  keywords = "luxury perfumes, fragrances, men cologne, women perfume, unisex scents, designer fragrances, premium perfumes",
  image = "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1200&h=630&fit=crop",
  url = "https://essence-express-mart.vercel.app",
  type = "website",
  product,
  structuredData,
}: SEOProps) => {
  const fullTitle = title.includes("ANAS FRAGRANCES")
    ? title
    : `${title} | ANAS FRAGRANCES`;
  const fullUrl = url.startsWith("http")
    ? url
    : `https://essence-express-mart.vercel.app${url}`;

  // Generate structured data for products
  const productStructuredData = product
    ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.image,
        brand: {
          "@type": "Brand",
          name: product.brand,
        },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "MAD",
          availability: "https://schema.org/InStock",
        },
        category: product.category,
      }
    : null;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ANAS FRAGRANCES",
    url: "https://essence-express-mart.vercel.app",
    logo: "https://essence-express-mart.vercel.app/logo.png",
    description: "Luxury perfume and fragrance retailer",
    sameAs: [
      "https://facebook.com/essenceexpress",
      "https://instagram.com/essenceexpress",
      "https://twitter.com/essenceexpress",
    ],
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="ANAS FRAGRANCES" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ANAS FRAGRANCES" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@essenceexpress" />
      <meta name="twitter:creator" content="@essenceexpress" />

      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
      />
      <meta name="apple-mobile-web-app-title" content="ANAS FRAGRANCES" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Structured Data */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: [product.image],
            description: product.description,
            sku: product.id,
            brand: {
              "@type": "Brand",
              name: product.brand,
            },
            offers: {
              "@type": "Offer",
              url: `${window.location.origin}/product/${product.id}`,
              priceCurrency: "MAD",
              price: product.price,
              availability:
                product.stock_quantity > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          })}
        </script>
      )}
      <script type="application/ld+json">
        {JSON.stringify(
          productStructuredData || structuredData || defaultStructuredData
        )}
      </script>
    </Helmet>
  );
};
