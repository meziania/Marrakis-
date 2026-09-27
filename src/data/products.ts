export type Product = {
  id: string;
  slug: string;
  name: string;
  arabicName?: string;
  subtitle: string;
  tagline: string;
  description: string;
  howToUse?: string;
  benefits: string[];
  price: number;
  image: string;
  accent: string;
  hidden?: boolean;
};

export const products: Product[] = [
  {
    id: "aker-fassi-nila",
    slug: "blue-nila-aker-fassi-body-scrub",
    name: "Blue Nila & Aker Fassi Body Scrub",
    subtitle: "Natural Body Scrub",
    tagline: "Nourish. Exfoliate. Reveal Softness.",
    description:
      "Indulge in a Moroccan-inspired body care ritual with our Blue Nila & Aker Fassi Body Scrub, a nourishing and moisturizing blend enriched with natural butters and oils. Formulated to gently exfoliate the skin and help remove dead skin cells, this body scrub leaves your skin feeling soft, smooth, and refreshed, with a comfortable, non-greasy finish. Infused with the traditional beauty essence of Blue Nila and Aker Fassi, it brings a touch of Moroccan heritage to your self-care routine.",
    howToUse:
      "Apply to damp skin in circular motions. Rinse thoroughly. Use 1–2 times per week as part of your hammam or shower ritual.",
    benefits: [
      "Helps remove dead skin cells",
      "Nourishes and moisturizes the skin",
      "Leaves skin feeling soft and smooth",
      "Provides a refreshing self-care experience",
      "Formulated with natural butters and oils",
    ],
    price: 180,
    image: "/products/aker-fassi-nila.jpg",
    accent: "#721c24",
  },
  {
    id: "ghassoul",
    slug: "herbal-infused-ghassoul",
    name: "Herbal-Infused Ghassoul",
    arabicName: "الغاسول مسقي بالأعشاب",
    subtitle: "Hair & Body · Natural Mineral Clay",
    tagline: "Detoxify. Purify. Restore.",
    description:
      "Traditional Moroccan ghassoul clay infused with a botanical herbal-water extract and a selection of aromatic herbs and flowers. A purifying mineral clay for hair and body, inspired by centuries of hammam care.",
    howToUse:
      "Mix with warm water to a smooth paste. Apply to hair or body, leave briefly, then rinse. Follow with your preferred moisturizer or oil.",
    benefits: [
      "Detoxifying mineral clay",
      "Suitable for hair and body",
      "Infused with herbal botanicals",
      "Part of a traditional hammam ritual",
    ],
    price: 150,
    image: "/products/ghassoul.jpg",
    accent: "#8B7355",
  },
  {
    id: "nila-bleu",
    slug: "nila-bleu",
    name: "Nila Bleu",
    arabicName: "النيلة الزرقاء",
    subtitle: "Mineral Powder · Natural Beauty Ritual",
    tagline: "The beauty of Blue Nila.",
    description:
      "A traditional Moroccan beauty ingredient used in hammam and skincare rituals. Pure Blue Nila mineral powder — a vivid indigo essence of Moroccan heritage for luminous, cared-for skin.",
    howToUse:
      "Use as part of your hammam or beauty ritual according to traditional Moroccan practice. Mix as directed for masks or ritual blends.",
    benefits: [
      "Traditional Moroccan hammam ingredient",
      "Natural mineral powder",
      "Heritage beauty ritual",
      "Iconic Blue Nila color and character",
    ],
    price: 120,
    image: "/products/nila-bleu.jpg",
    accent: "#1e3a8a",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(amount: number): string {
  return `${amount} DH`;
}
