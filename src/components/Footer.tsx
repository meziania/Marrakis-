import Image from "next/image";
import Link from "next/link";
import {
  instagramUrl,
  siteConfig,
  whatsappBaseUrl,
} from "@/lib/config";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div>
          <Link href="/" className={styles.brand} aria-label={siteConfig.name}>
            <Image
              src={siteConfig.logoSrc}
              alt={siteConfig.name}
              width={1157}
              height={1360}
              className={styles.logo}
            />
          </Link>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
        </div>

        <div>
          <p className={styles.colTitle}>Explore</p>
          <div className={styles.links}>
            <Link href="/shop">Shop</Link>
            <Link href="/loyalty">Loyalty</Link>
            <Link href="/about">About</Link>
          </div>
        </div>

        <div>
          <p className={styles.colTitle}>Connect</p>
          <div className={styles.links}>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram @{siteConfig.instagramHandle}
            </a>
            <a
              href={`${whatsappBaseUrl}?text=${encodeURIComponent(
                `Hello ${siteConfig.name}, I have a question about your products.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© 2026 {siteConfig.name}</span>
        <Link href="/admin">Admin</Link>
        <span>Moroccan hammam rituals, made for modern self-care</span>
      </div>
      <p className={`container ${styles.credit}`}>
        Developed by{" "}
        <a href="https://cx-systems.vercel.app/" target="_blank" rel="noopener noreferrer">
          CX Systems
        </a>
      </p>
    </footer>
  );
}
