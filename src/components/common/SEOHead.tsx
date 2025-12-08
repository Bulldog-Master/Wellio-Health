/**
 * SEOHead Component
 * 
 * Provides translated meta tags for SEO across all pages.
 * Updates document head with language-appropriate content.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  titleKey: string;
  descriptionKey?: string;
  namespace?: string;
  titleParams?: Record<string, string | number>;
  descriptionParams?: Record<string, string | number>;
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
}

export const SEOHead = ({
  titleKey,
  descriptionKey,
  namespace = 'seo',
  titleParams = {},
  descriptionParams = {},
  canonical,
  noIndex = false,
  ogImage = '/og-image.png',
  ogType = 'website',
}: SEOHeadProps) => {
  const { t, i18n } = useTranslation(namespace);
  
  useEffect(() => {
    // Get translated values
    const title = t(titleKey, titleParams);
    const description = descriptionKey ? t(descriptionKey, descriptionParams) : '';
    const lang = i18n.language || 'en';
    
    // Update document title
    document.title = title.includes('Wellio') ? title : `${title} | Wellio`;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    
    // Standard meta tags
    if (description) {
      updateMeta('description', description);
    }
    
    // Language
    document.documentElement.lang = lang;
    updateMeta('language', lang);
    
    // Robots
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }
    
    // Open Graph tags
    updateMeta('og:title', title, true);
    if (description) {
      updateMeta('og:description', description, true);
    }
    updateMeta('og:type', ogType, true);
    updateMeta('og:locale', lang, true);
    if (ogImage) {
      updateMeta('og:image', ogImage, true);
    }
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    if (description) {
      updateMeta('twitter:description', description);
    }
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    } else if (canonicalLink) {
      canonicalLink.remove();
    }
    
    // Alternate language links (for multilingual SEO)
    const languages = ['en', 'es', 'de', 'fr', 'pt', 'zh'];
    const currentPath = window.location.pathname;
    
    // Remove existing alternate links
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    
    // Add alternate links for each language
    languages.forEach(langCode => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = langCode;
      // In a real app, you'd have language-specific URLs
      // For now, we use the same URL with a lang parameter hint
      link.href = `${window.location.origin}${currentPath}`;
      document.head.appendChild(link);
    });
    
    // x-default for language selection
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.hreflang = 'x-default';
    defaultLink.href = `${window.location.origin}${currentPath}`;
    document.head.appendChild(defaultLink);
    
  }, [t, i18n.language, titleKey, descriptionKey, titleParams, descriptionParams, canonical, noIndex, ogImage, ogType]);
  
  return null; // This component doesn't render anything
};

export default SEOHead;