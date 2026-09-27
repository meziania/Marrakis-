"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { products } from "@/data/products";
import { siteConfig } from "@/lib/config";
import styles from "./BrandFilm.module.css";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_SLIDES = products.map((p) => ({
  src: p.image,
  label: p.name,
}));

export function BrandFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useVideo, setUseVideo] = useState(false);
  const [slide, setSlide] = useState(0);
  const videoSrc = siteConfig.videos.ritualFilm;

  useEffect(() => {
    if (!videoSrc) return;
    let cancelled = false;
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = videoSrc;
    const onOk = () => {
      if (!cancelled) setUseVideo(true);
    };
    const onFail = () => {
      if (!cancelled) setUseVideo(false);
    };
    probe.addEventListener("loadeddata", onOk);
    probe.addEventListener("error", onFail);
    return () => {
      cancelled = true;
      probe.removeEventListener("loadeddata", onOk);
      probe.removeEventListener("error", onFail);
      probe.removeAttribute("src");
      probe.load();
    };
  }, [videoSrc]);

  useEffect(() => {
    if (useVideo) return;
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % FALLBACK_SLIDES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [useVideo]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-film-copy]", {
        y: 48,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
        },
      });

      gsap.to("[data-film-media]", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!useVideo || !video) return;
    void video.play().catch(() => {
      /* autoplay may be blocked — controls overlay handles it */
    });
  }, [useVideo]);

  return (
    <section ref={sectionRef} className={styles.film} aria-label="Brand film">
      <div className={styles.media} data-film-media>
        {useVideo && videoSrc ? (
          <video
            ref={videoRef}
            className={styles.video}
            src={videoSrc}
            muted
            loop
            playsInline
            autoPlay
            poster={FALLBACK_SLIDES[0].src}
          />
        ) : (
          <div className={styles.slides}>
            {FALLBACK_SLIDES.map((item, i) => (
              <div
                key={item.src}
                className={`${styles.slide} ${
                  i === slide ? styles.slideActive : ""
                }`}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  sizes="100vw"
                  priority={i === 0}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}
        <div className={styles.veil} aria-hidden />
      </div>

      <div className={`container ${styles.copy}`} data-film-copy>
        <p className={styles.eyebrow}>Brand film</p>
        <h2 className={styles.title}>Care should feel like an experience</h2>
        <p className={styles.text}>
          Texture, color, and ritual — a cinematic glimpse of MARRAKISSE before
          you step into the collection.
        </p>
      </div>
    </section>
  );
}
