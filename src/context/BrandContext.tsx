import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface BrandContextType {
  brandColor: string;
  companyLogo: string | null;
  setBrandColor: (color: string) => void;
  setCompanyLogo: (logo: string | null) => void;
  resetBrand: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  // Default Tailwind blue-600
  const DEFAULT_COLOR = '#2563eb';

  const [brandColor, setBrandColorState] = useState<string>(() => {
    return localStorage.getItem('brand_color') || DEFAULT_COLOR;
  });

  const [companyLogo, setCompanyLogoState] = useState<string | null>(() => {
    return localStorage.getItem('brand_logo');
  });

  const setBrandColor = (color: string) => {
    setBrandColorState(color);
    localStorage.setItem('brand_color', color);
  };

  const setCompanyLogo = (logo: string | null) => {
    setCompanyLogoState(logo);
    if (logo) {
      localStorage.setItem('brand_logo', logo);
    } else {
      localStorage.removeItem('brand_logo');
    }
  };

  const resetBrand = () => {
    setBrandColor(DEFAULT_COLOR);
    setCompanyLogo(null);
  };

  // Sync with CSS variables for dynamic theming
  useEffect(() => {
    const root = document.documentElement;
    // Set the brand color RGB values for Tailwind opacity support if needed
    // But simplest for now is probably checking where blue-600 is used.
    // However, Tailwind classes like bg-blue-600 are static.
    // To influence the theme "globally", I might need to override the index.css or 
    // simply rely on the BrandSettingsModal to show the effect, 
    // and injecting a <style> tag or setting a CSS variable that we use in critical places.

    // For a true "White Label", we might want to override the primary color.
    // If the app uses "bg-blue-600", we can't easily change it via variable unless we defined the color as a variable in Tailwind config.
    // Since I can't easily change tailwind config (it's built), 
    // I can try to set a global style that overrides commonly used blue-600 classes IF they are used.
    // OR, I can just expose the color to components that want to use it.

    // The user said "alterar o tema do app".
    // I will try to update the --color-primary variable if it exists, or inject a style.

    root.style.setProperty('--brand-color', brandColor);

    // HACK: Force override some specific tailwind blue classes if necessary, 
    // or we assume the user accepts that "Theme" mainly affects the PDF and components that Opt-in.
    // But "change the app theme" implies a broader change.
    // Let's at least set the variable.

    // Also, if I want to override Tailwind's blue-600 dynamically:
    // .bg-blue-600 { background-color: var(--brand-color) !important; }
    // .text-blue-600 { color: var(--brand-color) !important; }
    // .border-blue-600 { border-color: var(--brand-color) !important; }

    const styleId = 'brand-theme-override';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --brand-color: ${brandColor};
      }
      .bg-blue-600 { background-color: ${brandColor} !important; }
      .text-blue-600 { color: ${brandColor} !important; }
      .border-blue-600 { border-color: ${brandColor} !important; }
      .hover\\:bg-blue-700:hover { background-color: ${darkenColor(brandColor, 20)} !important; }
      .hover\\:text-blue-700:hover { color: ${darkenColor(brandColor, 20)} !important; }
    `;

  }, [brandColor]);

  return (
    <BrandContext.Provider value={{ brandColor, companyLogo, setBrandColor, setCompanyLogo, resetBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}

// Utility to darken color for hover states (quick and dirty hex manipulation)
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const B = ((num >> 8) & 0x00ff) - amt;
  const G = (num & 0x0000ff) - amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
    (G < 255 ? (G < 1 ? 0 : G) : 255)
  ).toString(16).slice(1);
}
