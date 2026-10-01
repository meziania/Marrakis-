"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteConfig } from "@/lib/config";
import { heroSupport } from "@/lib/collection";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);

const trayIngredients = [
  "Argan",
  "Aker Fassi rock",
  "Nila rock",
  "Sugar scrub",
  "Argan oil",
];

export function Hero({ productCount }: { productCount: number }) {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroVideoSrc = `${siteConfig.videos.heroBg}?v=img2924`;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero-eyebrow]", { y: 24, opacity: 0, duration: 0.8 })
        .from("[data-hero-brand]", { y: 50, opacity: 0, duration: 1.1 }, "-=0.4")
        .from(
          "[data-hero-line]",
          { y: 30, opacity: 0, duration: 0.9 },
          "-=0.65"
        )
        .from(
          "[data-hero-support]",
          { y: 20, opacity: 0, duration: 0.8 },
          "-=0.55"
        )
        .from(
          "[data-hero-cta]",
          { y: 16, opacity: 0, duration: 0.7, stagger: 0.1 },
          "-=0.45"
        )
        .from(
          "[data-hero-tray]",
          { y: 24, opacity: 0, duration: 0.9 },
          "-=0.7"
        )
        .from(
          "[data-hero-ingredient]",
          { y: 10, opacity: 0, duration: 0.45, stagger: 0.08 },
          "-=0.45"
        );

      gsap.to("[data-hero-video]", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);

    const stage = root.querySelector<HTMLElement>("[data-hero-stage]");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onMove = (event: PointerEvent) => {
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(stage, {
        rotateY: x * 7,
        rotateX: -y * 6,
        transformPerspective: 1000,
        duration: 0.55,
        ease: "power2.out",
        overwrite: "auto",
      });
    };
    const onLeave = () => {
      if (!stage) return;
      gsap.to(stage, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: "power3.out",
        overwrite: "auto",
      });
    };
    if (stage && finePointer && !reduceMotion) {
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stage?.removeEventListener("pointermove", onMove);
      stage?.removeEventListener("pointerleave", onLeave);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.eyebrow} data-hero-eyebrow>
          Moroccan Hammam Rituals
        </p>
        <div className={styles.brandBlock} data-hero-brand>
          <p className={styles.brandArabic} lang="ar" dir="rtl">
            {siteConfig.nameArabic}
          </p>
          <h1 className={styles.brand}>{siteConfig.name}</h1>
          <p className={styles.brandAmazigh} lang="zgh">
            {siteConfig.nameAmazigh}
          </p>
        </div>
        <p className={styles.headline} data-hero-line>
          {siteConfig.tagline}
        </p>
        <p className={styles.support} data-hero-support>
          {heroSupport(productCount)}
        </p>
        <div className={styles.ctas}>
          <Link href="/shop" className="btn btn-primary" data-hero-cta>
            Shop the ritual
          </Link>
          <Link href="/about" className="btn btn-outline" data-hero-cta>
            Our story
          </Link>
        </div>
      </div>

      <div className={styles.scene} data-hero-video>
        <div className={styles.stage} data-hero-stage>
          <div className={styles.videoFrame}>
            <video
              ref={videoRef}
              className={styles.heroVideo}
              src={heroVideoSrc}
              muted
              loop
              playsInline
              autoPlay
              poster="/products/nila-bleu.jpg"
            />
            <div className={styles.veil} aria-hidden />
          </div>
          <figure className={styles.tray} data-hero-tray>
            <Image
              src="/brand/heritage-tray.png"
              alt="Brass tray holding argan nuts, aker fassi rock, nila rock, sugar scrub, and argan oil"
              width={1024}
              height={1024}
              priority
            />
          </figure>
        </div>
        <p className={styles.legend}>
          {trayIngredients.map((name) => (
            <span key={name} data-hero-ingredient>
              {name}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
