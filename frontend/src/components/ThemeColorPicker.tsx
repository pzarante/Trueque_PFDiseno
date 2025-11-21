import { motion } from "motion/react";
import { Palette, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export type ThemeColor = "blue" | "purple" | "red" | "orange" | "green";

interface ThemeColorPickerProps {
  currentColor: ThemeColor;
  onColorChange: (color: ThemeColor) => void;
}

const COLOR_OPTIONS: { value: ThemeColor; label: string; gradient: string; sample: string }[] = [
  {
    value: "blue",
    label: "Azul",
    gradient: "from-blue-600 to-cyan-600",
    sample: "#0066ff",
  },
  {
    value: "purple",
    label: "Morado",
    gradient: "from-purple-600 to-pink-600",
    sample: "#8b5cf6",
  },
  {
    value: "red",
    label: "Rojo",
    gradient: "from-red-600 to-rose-600",
    sample: "#ef4444",
  },
  {
    value: "orange",
    label: "Naranja",
    gradient: "from-orange-600 to-amber-600",
    sample: "#f97316",
  },
  {
    value: "green",
    label: "Verde",
    gradient: "from-green-600 to-emerald-600",
    sample: "#10b981",
  },
];

export function ThemeColorPicker({ currentColor, onColorChange }: ThemeColorPickerProps) {
  const [open, setOpen] = useState(false);
  const currentOption = COLOR_OPTIONS.find(opt => opt.value === currentColor);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="min-w-[44px] min-h-[44px] relative"
          aria-label="Cambiar color del tema"
          type="button"
        >
          <div className="relative">
            <Palette className="w-5 h-5" />
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-background"
              style={{ backgroundColor: currentOption?.sample }}
              aria-hidden="true"
            />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm">Color del Tema</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {COLOR_OPTIONS.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onColorChange(option.value);
                  setOpen(false);
                }}
                className={`relative min-w-[44px] min-h-[44px] rounded-full bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg hover:shadow-xl transition-all ${
                  currentColor === option.value ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : ""
                }`}
                aria-label={`Cambiar a color ${option.label}`}
                aria-pressed={currentColor === option.value}
              >
                {currentColor === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5 text-white drop-shadow-lg" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {currentOption?.label}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
