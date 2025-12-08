import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  structuredData?: object;
}

export const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  noIndex = false,
  structuredData
}: SEOHeadProps) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  
  useEffect(() => {
    // Set document title
    document.title = title;
    
    // Helper to set meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Set meta description
    if (description) {
      setMetaTag('description', description);
      setMetaTag('og:description', description, true);
      setMetaTag('twitter:description', description);
    }
    
    // Set keywords
    if (keywords) {
      setMetaTag('keywords', keywords);
    }
    
    // Set Open Graph tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:locale', currentLang, true);
    
    if (ogImage) {
      setMetaTag('og:image', ogImage, true);
      setMetaTag('twitter:image', ogImage);
    }
    
    if (canonicalUrl) {
      setMetaTag('og:url', canonicalUrl, true);
      
      // Set canonical link
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    }
    
    // Set Twitter card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    
    // Set robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    }
    
    // Set structured data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
    
    // Set language
    document.documentElement.lang = currentLang;
    
  }, [title, description, keywords, canonicalUrl, ogImage, ogType, noIndex, structuredData, currentLang]);
  
  return null;
};

export default SEOHead;
