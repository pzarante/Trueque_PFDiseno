import { ThemeColor } from "../ThemeColorPicker";

export const getGradientClasses = (color: ThemeColor = "blue"): {
  from: string;
  to: string;
  full: string;
  shadow: string;
} => {
  const gradients = {
    blue: {
      from: "from-blue-600",
      to: "to-cyan-600",
      full: "from-blue-600 to-cyan-600",
      shadow: "shadow-blue-500/30",
    },
    purple: {
      from: "from-purple-600",
      to: "to-pink-600",
      full: "from-purple-600 to-pink-600",
      shadow: "shadow-purple-500/30",
    },
    red: {
      from: "from-red-600",
      to: "to-rose-600",
      full: "from-red-600 to-rose-600",
      shadow: "shadow-red-500/30",
    },
    orange: {
      from: "from-orange-600",
      to: "to-amber-600",
      full: "from-orange-600 to-amber-600",
      shadow: "shadow-orange-500/30",
    },
    green: {
      from: "from-green-600",
      to: "to-emerald-600",
      full: "from-green-600 to-emerald-600",
      shadow: "shadow-green-500/30",
    },
  };

  return gradients[color];
};

export const getColorName = (color: ThemeColor): string => {
  const names = {
    blue: "Azul",
    purple: "Morado",
    red: "Rojo",
    orange: "Naranja",
    green: "Verde",
  };

  return names[color];
};
