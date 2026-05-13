export const CATEGORY_LABELS = {
  MUSICA:      "🎵 Música",
  DEPORTE:     "⚽ Deporte",
  ARTE:        "🎨 Arte",
  TECNOLOGIA:  "💻 Tecnología",
  GASTRONOMIA: "🍽️ Gastronomía",
  EDUCACION:   "📚 Educación",
  NEGOCIOS:    "💼 Negocios",
  OTRO:        "📌 Otro",
};

export const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));
