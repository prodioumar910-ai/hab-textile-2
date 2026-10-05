import { useState, useEffect } from 'react';

/**
 * Centralized Application Constants & Brand Assets
 * Derived from the authentic brand image provided by the user
 */

export const BRAND_NAME = 'Habé';
export const BRAND_TAGLINE = "L'élégance et la tradition de la mode africaine haut de gamme";

// Asset cache version to prevent browsers & Service Workers from serving stale logos
export const ASSET_VERSION = '20261002_v19';

// Dynamic brand logo helper (checks for runtime custom logo override from admin, falls back to new official assets)
export function getActiveLogo(type: 'logo' | 'logo-white' | 'wide' | 'wide-white' | 'icon' | 'original' = 'logo'): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('habe_custom_logo_url');
    if (custom && custom.trim().length > 5) {
      return custom.trim();
    }
  }
  switch (type) {
    case 'logo-white': return `/logo-white.png?v=${ASSET_VERSION}`;
    case 'wide': return `/logo-wide.png?v=${ASSET_VERSION}`;
    case 'wide-white': return `/logo-wide-white.png?v=${ASSET_VERSION}`;
    case 'icon': return `/logo-icon.png?v=${ASSET_VERSION}`;
    case 'original': return `/logo.jpeg?v=${ASSET_VERSION}`;
    default: return `/logo.png?v=${ASSET_VERSION}`;
  }
}

export interface BrandLogoState {
  logo: string;
  logoWhite: string;
  logoWide: string;
  logoWideWhite: string;
  logoIcon: string;
  customLogo: string | null;
  isCustom: boolean;
}

export function useBrandLogo(): BrandLogoState {
  const getSnapshot = (): BrandLogoState => {
    const custom = typeof window !== 'undefined' ? localStorage.getItem('habe_custom_logo_url') : null;
    const isCustom = Boolean(custom && custom.trim().length > 5);
    return {
      logo: getActiveLogo('logo'),
      logoWhite: getActiveLogo('logo-white'),
      logoWide: getActiveLogo('wide'),
      logoWideWhite: getActiveLogo('wide-white'),
      logoIcon: getActiveLogo('icon'),
      customLogo: isCustom ? custom!.trim() : null,
      isCustom
    };
  };

  const [state, setState] = useState<BrandLogoState>(getSnapshot);

  useEffect(() => {
    const update = () => setState(getSnapshot());
    window.addEventListener('storage', update);
    window.addEventListener('habe_logo_updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('habe_logo_updated', update);
    };
  }, []);

  return state;
}

// Logo assets (guaranteed fresh with query buster):
// Primary authentic logo (authentic pure stylized 'h' emblem, transparent background)
export const APP_LOGO = `/logo.png?v=${ASSET_VERSION}`;

// Inverted logo for dark backgrounds, dark headers, and footer (authentic emblem + white text)
export const APP_LOGO_WHITE = `/logo-white.png?v=${ASSET_VERSION}`;

// Horizontal lockup (authentic emblem + text side-by-side for navigation bar)
export const APP_LOGO_WIDE = `/logo-wide.png?v=${ASSET_VERSION}`;
export const APP_LOGO_WIDE_WHITE = `/logo-wide-white.png?v=${ASSET_VERSION}`;

// Standalone monogram emblem icon (pure vibrant orange stylized 'h' emblem, transparent background)
export const APP_LOGO_ICON = `/logo-icon.png?v=${ASSET_VERSION}`;

// Standalone typography wordmark (for dark and light backgrounds)
export const APP_LOGO_TEXT = `/logo-text.png?v=${ASSET_VERSION}`;
export const APP_LOGO_TEXT_WHITE = `/logo-text-white.png?v=${ASSET_VERSION}`;

// Original master logo
export const APP_LOGO_ORIGINAL = `/logo.jpeg?v=${ASSET_VERSION}`;

// Square high-resolution app icon for PWA, bookmarks & mobile installation
export const APP_ICON = `/icon-192.png?v=${ASSET_VERSION}`;
