export const siteConfig = {
  /** Brand logo image in /public */
  logoSrc: "/brand/logo-brand.png",
  name: "MARRAKISSÉ",
  nameArabic: "مراكيسه",
  nameAmazigh: "ⵎⴰⵔⵔⴰⴽⵉⵙⵙⵉ",
  tagline: "A Timeless Moroccan Hammam Ritual",
  description:
    "Premium Moroccan skincare rooted in traditional hammam rituals — natural clays, botanicals, and Blue Nila.",
  /** WhatsApp in international format, digits only */
  whatsappNumber: "971561693826",
  /** Instagram handle without @ */
  instagramHandle: "marrakisse0",
  currency: "MAD" as const,
  currencySymbol: "DH",
  /**
   * Branding videos (Motion / After Effects exports).
   * Drop files in `public/videos/` then set the paths below.
   * Leave empty string to use the animated product film fallback.
   */
  videos: {
    /** Right side of the first hero section (looping background) */
    heroBg: "/videos/hero-bg.mp4",
    /** Full-bleed ritual film lower on the homepage */
    ritualFilm: "/videos/ritual-film.mp4",
    /** Optional short loop for product pages later */
    productTeaser: "",
  },
};

export const instagramUrl = `https://instagram.com/${siteConfig.instagramHandle}`;
export const whatsappBaseUrl = `https://wa.me/${siteConfig.whatsappNumber}`;
