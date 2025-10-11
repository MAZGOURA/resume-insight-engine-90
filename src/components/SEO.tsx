import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
}: SEOProps) => {
  const location = useLocation();

  const defaultTitle = "ANAS FRAGRANCES - Premium Perfume Collection";
  const defaultDescription =
    "Discover luxury fragrances at ANAS FRAGRANCES. Shop our curated collection of premium perfumes, colognes, and designer fragrances for men and women. Free shipping on orders over 300 MAD.";
  const defaultKeywords =
    "perfume, cologne, fragrance, luxury, designer, Morocco, ANAS FRAGRANCES, oud, floral, oriental, woody, citrus";
  const defaultImage = "/placeholder.svg";
  const defaultUrl = `https://anasfragrances.com${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title ? `${title} | ANAS FRAGRANCES` : defaultTitle;

    // Update meta tags
    updateMetaTag("description", description || defaultDescription);
    updateMetaTag("keywords", keywords || defaultKeywords);

    // Update Open Graph tags
    updateMetaTag("og:title", title || defaultTitle);
    updateMetaTag("og:description", description || defaultDescription);
    updateMetaTag("og:image", image || defaultImage);
    updateMetaTag("og:url", url || defaultUrl);
    updateMetaTag("og:type", type);

    // Update Twitter tags
    updateMetaTag("twitter:title", title || defaultTitle);
    updateMetaTag("twitter:description", description || defaultDescription);
    updateMetaTag("twitter:image", image || defaultImage);
    updateMetaTag("twitter:card", "summary_large_image");

    // Update canonical URL
    updateCanonicalUrl(url || defaultUrl);
  }, [title, description, keywords, image, url, type, location.pathname]);

  const updateMetaTag = (name: string, content: string) => {
    let element =
      document.querySelector(`meta[name="${name}"]`) ||
      document.querySelector(`meta[property="${name}"]`);

    if (!element) {
      element = document.createElement("meta");
      if (name.startsWith("og:") || name.startsWith("twitter:")) {
        element.setAttribute("property", name);
      } else {
        element.setAttribute("name", name);
      }
      document.head.appendChild(element);
    }

    element.setAttribute("content", content);
  };

  const updateCanonicalUrl = (url: string) => {
    let link = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }

    link.setAttribute("href", url);
  };

  return null;
};
