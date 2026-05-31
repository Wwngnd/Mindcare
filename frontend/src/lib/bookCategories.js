const categoryRules = [
  { key: "mindfulness", match: ["mindfulness", "meditasi", "meditation"] },
  { key: "spirituality", match: ["spirituality", "spiritual", "spiritualitas"] },
  { key: "psychology", match: ["psychology", "psikologi", "cognitive", "kognitif"] },
  { key: "fiction", match: ["fiction", "fiksi", "novel"] },
  { key: "education", match: ["education", "edukasi", "study skills", "academic", "akademik", "belajar"] },
  { key: "career", match: ["career", "karier", "professional", "pekerjaan"] },
  { key: "business", match: ["business", "bisnis", "entrepreneur", "wirausaha"] },
  { key: "finance", match: ["finance", "financial", "keuangan", "investing", "investasi", "personal finance"] },
  { key: "social", match: ["social", "sosial", "community", "komunitas"] },
  { key: "health", match: ["health", "mental health", "kesehatan", "wellness"] },
  { key: "philosophy", match: ["philosophy", "filosofi", "filsafat"] },
  { key: "productivity", match: ["productivity", "produktif", "produktifitas", "produktivitas"] },
  { key: "relationships", match: ["relationships", "relasi", "hubungan"] },
  { key: "science", match: ["science", "sains", "neuroscience", "neurosains"] },
  { key: "memoir", match: ["memoir", "biografi"] },
  { key: "communication", match: ["communication", "komunikasi"] },
  { key: "management", match: ["management", "manajemen"] },
  { key: "selfhelp", match: ["self help", "self-help", "pengembangan diri", "self improvement", "motivasi"] },
];

export const pickBookCategoryKeys = (categoriesText = "") => {
  const text = String(categoriesText).toLowerCase();
  const matched = categoryRules
    .filter((rule) => rule.match.some((keyword) => text.includes(keyword)))
    .map((rule) => rule.key);

  if (!matched.length) return ["selfhelp"];
  return [...new Set(matched)];
};

