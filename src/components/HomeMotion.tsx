"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HomeMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-ritual-copy]", {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-ritual]", start: "top 78%" },
      });
      gsap.from("[data-step]", {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.16,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-steps]", start: "top 80%" },
      });
      gsap.from("[data-arch]", {
        y: 48,
        scale: 0.94,
        opacity: 0,
        duration: 1.05,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-arch]", start: "top 82%" },
      });
    });

    return () => ctx.revert();
  }, []);

  return null;
}
