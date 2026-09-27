"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { instagramUrl, siteConfig } from "@/lib/config";
import styles from "./Header.module.css";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={siteConfig.name}>
          <Image
            src={siteConfig.logoSrc}
            alt={siteConfig.name}
            width={1157}
            height={1360}
            className={styles.logo}
            priority
          />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link href="/shop">Shop</Link>
          <Link href="/loyalty">Loyalty</Link>
          <Link href="/about">About</Link>
        </nav>

        <div className={styles.actions}>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="Instagram"
          >
            Instagram
          </a>
          <button
            type="button"
            className={`${styles.menuBtn} ${open ? styles.menuBtnOpen : ""}`}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.mobile}>
          <Link href="/shop" onClick={() => setOpen(false)}>
            Shop
          </Link>
          <Link href="/loyalty" onClick={() => setOpen(false)}>
            Loyalty
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}>
            About
          </Link>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            Instagram
          </a>
        </div>
      )}
    </header>
  );
}
