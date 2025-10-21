import { createContext, useContext, ReactNode } from "react";
import { ThemeColor } from "../components/ThemeColorPicker";

interface ThemeColorContextType {
  themeColor: ThemeColor;
}

const ThemeColorContext = createContext<ThemeColorContextType>({ themeColor: "blue" });

export function ThemeColorProvider({ children, themeColor }: { children: ReactNode; themeColor: ThemeColor }) {
  return (
    <ThemeColorContext.Provider value={{ themeColor }}>
      {children}
    </ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  return useContext(ThemeColorContext);
}

// Helper functions for dynamic color classes
export function getGradientClasses(color: ThemeColor): string {
  const gradients = {
    blue: "from-blue-600 to-cyan-600",
    purple: "from-purple-600 to-pink-600",
    red: "from-red-600 to-rose-600",
    orange: "from-orange-600 to-amber-600",
    green: "from-green-600 to-emerald-600",
  };
  return gradients[color];
}

export function getGradientHoverClasses(color: ThemeColor): string {
  const gradients = {
    blue: "hover:from-blue-700 hover:to-cyan-700",
    purple: "hover:from-purple-700 hover:to-pink-700",
    red: "hover:from-red-700 hover:to-rose-700",
    orange: "hover:from-orange-700 hover:to-amber-700",
    green: "hover:from-green-700 hover:to-emerald-700",
  };
  return gradients[color];
}

export function getShadowClasses(color: ThemeColor): string {
  const shadows = {
    blue: "shadow-blue-500/30",
    purple: "shadow-purple-500/30",
    red: "shadow-red-500/30",
    orange: "shadow-orange-500/30",
    green: "shadow-green-500/30",
  };
  return shadows[color];
}

export function getHoverShadowClasses(color: ThemeColor): string {
  const shadows = {
    blue: "hover:shadow-blue-500/40",
    purple: "hover:shadow-purple-500/40",
    red: "hover:shadow-red-500/40",
    orange: "hover:shadow-orange-500/40",
    green: "hover:shadow-green-500/40",
  };
  return shadows[color];
}

export function getTextClasses(color: ThemeColor): string {
  const texts = {
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    red: "text-red-600 dark:text-red-400",
    orange: "text-orange-600 dark:text-orange-400",
    green: "text-green-600 dark:text-green-400",
  };
  return texts[color];
}

export function getBgClasses(color: ThemeColor): string {
  const bgs = {
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    orange: "bg-orange-600",
    green: "bg-green-600",
  };
  return bgs[color];
}

export function getBorderClasses(color: ThemeColor): string {
  const borders = {
    blue: "border-blue-600 dark:border-blue-400",
    purple: "border-purple-600 dark:border-purple-400",
    red: "border-red-600 dark:border-red-400",
    orange: "border-orange-600 dark:border-orange-400",
    green: "border-green-600 dark:border-green-400",
  };
  return borders[color];
}

export function getAccentBgClasses(color: ThemeColor): string {
  const bgs = {
    blue: "bg-blue-100 dark:bg-blue-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    red: "bg-red-100 dark:bg-red-900/30",
    orange: "bg-orange-100 dark:bg-orange-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
  };
  return bgs[color];
}

export function getAccentBorderClasses(color: ThemeColor): string {
  const borders = {
    blue: "border-blue-200 dark:border-blue-700",
    purple: "border-purple-200 dark:border-purple-700",
    red: "border-red-200 dark:border-red-700",
    orange: "border-orange-200 dark:border-orange-700",
    green: "border-green-200 dark:border-green-700",
  };
  return borders[color];
}

export function getAccentTextClasses(color: ThemeColor): string {
  const texts = {
    blue: "text-blue-700 dark:text-blue-300",
    purple: "text-purple-700 dark:text-purple-300",
    red: "text-red-700 dark:text-red-300",
    orange: "text-orange-700 dark:text-orange-300",
    green: "text-green-700 dark:text-green-300",
  };
  return texts[color];
}

export function getHeroBackgroundClasses(color: ThemeColor): string {
  const backgrounds = {
    blue: "from-blue-50 via-cyan-50 to-blue-100 dark:from-[#0a1628] dark:via-[#0d1f38] dark:to-[#0a1628]",
    purple: "from-purple-50 via-pink-50 to-purple-100 dark:from-[#1a0a28] dark:via-[#2a0d38] dark:to-[#1a0a28]",
    red: "from-red-50 via-rose-50 to-red-100 dark:from-[#280a0a] dark:via-[#380d0d] dark:to-[#280a0a]",
    orange: "from-orange-50 via-amber-50 to-orange-100 dark:from-[#281a0a] dark:via-[#382a0d] dark:to-[#281a0a]",
    green: "from-green-50 via-emerald-50 to-green-100 dark:from-[#0a280a] dark:via-[#0d380d] dark:to-[#0a280a]",
  };
  return backgrounds[color];
}

export function getHeroOrbColors(color: ThemeColor): { orb1: string; orb2: string; orb3: string } {
  const orbs = {
    blue: {
      orb1: "from-blue-400 to-cyan-400",
      orb2: "from-blue-500 to-blue-600",
      orb3: "from-cyan-400 to-blue-500",
    },
    purple: {
      orb1: "from-purple-400 to-pink-400",
      orb2: "from-purple-500 to-purple-600",
      orb3: "from-pink-400 to-purple-500",
    },
    red: {
      orb1: "from-red-400 to-rose-400",
      orb2: "from-red-500 to-red-600",
      orb3: "from-rose-400 to-red-500",
    },
    orange: {
      orb1: "from-orange-400 to-amber-400",
      orb2: "from-orange-500 to-orange-600",
      orb3: "from-amber-400 to-orange-500",
    },
    green: {
      orb1: "from-green-400 to-emerald-400",
      orb2: "from-green-500 to-green-600",
      orb3: "from-emerald-400 to-green-500",
    },
  };
  return orbs[color];
}

export function getParticleColor(color: ThemeColor): string {
  const particles = {
    blue: "bg-blue-400/40 dark:bg-cyan-400/40",
    purple: "bg-purple-400/40 dark:bg-pink-400/40",
    red: "bg-red-400/40 dark:bg-rose-400/40",
    orange: "bg-orange-400/40 dark:bg-amber-400/40",
    green: "bg-green-400/40 dark:bg-emerald-400/40",
  };
  return particles[color];
}
