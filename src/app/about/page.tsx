import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { instagramUrl, siteConfig, whatsappBaseUrl } from "@/lib/config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description: "The story of MARRAKISSE — Moroccan hammam rituals for modern care.",
};

export default function AboutPage() {
  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.layout}>
        <Reveal className={styles.copy}>
          <p className="eyebrow">About</p>
          <h1 className="section-title">{siteConfig.name}</h1>
          <p>
            MARRAKISSE is a Moroccan skincare brand rooted in hammam tradition —
            mineral clays, herbal infusions, and the iconic beauty of Blue Nila.
          </p>
          <p>
            Each formula is designed as part of a ritual: prepare, purify,
            nourish. We believe a website — like a fragrance or a scrub — should
            feel like an experience, not a catalogue.
          </p>
          <p>
            Follow our journey on Instagram, or message us on WhatsApp to order
            your selection.
          </p>
          <div className={styles.links}>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              @{siteConfig.instagramHandle}
            </a>
            <a
              href={`${whatsappBaseUrl}?text=${encodeURIComponent(
                "Hello MARRAKISSE!"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              WhatsApp
            </a>
            <Link href="/shop" className="btn btn-outline">
              Shop
            </Link>
          </div>
        </Reveal>
        <Reveal className={styles.media} y={50}>
          <Image
            src="/products/ghassoul.jpg"
            alt="Herbal-Infused Ghassoul"
            fill
            sizes="(max-width: 900px) 100vw, 40vw"
            style={{ objectFit: "cover" }}
          />
        </Reveal>
      </div>
    </div>
  );
}
