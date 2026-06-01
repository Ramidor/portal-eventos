import { Music2, Dumbbell, Palette, Cpu, UtensilsCrossed, BookOpen, Briefcase, Tag } from "lucide-react";

export const CATEGORY_LABELS = {
  MUSICA:      "Música",
  DEPORTE:     "Deporte",
  ARTE:        "Arte",
  TECNOLOGIA:  "Tecnología",
  GASTRONOMIA: "Gastronomía",
  EDUCACION:   "Educación",
  NEGOCIOS:    "Negocios",
  OTRO:        "Otro",
};

export const CATEGORY_ICONS = {
  MUSICA:      Music2,
  DEPORTE:     Dumbbell,
  ARTE:        Palette,
  TECNOLOGIA:  Cpu,
  GASTRONOMIA: UtensilsCrossed,
  EDUCACION:   BookOpen,
  NEGOCIOS:    Briefcase,
  OTRO:        Tag,
};

export const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));
