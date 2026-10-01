import Image from "next/image";
import Link from "next/link";
import { BrandFilm } from "@/components/BrandFilm";
import { Hero } from "@/components/Hero";
import { HomeMotion } from "@/components/HomeMotion";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { getVisibleProducts } from "@/lib/store";
import { homeCollectionTitle } from "@/lib/collection";
import { instagramUrl, siteConfig } from "@/lib/config";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

const ritualOrder = [
  { id: "aker-fassi-nila", verb: "Exfoliate" },
  { id: "ghassoul", verb: "Purify" },
  { id: "nila-bleu", verb: "Reveal" },
];

export default function HomePage() {
  const products = getVisibleProducts();
  const steps = ritualOrder.flatMap((step, index) => {
    const product = products.find((item) => item.id === step.id);
    return product ? [{ ...step, product, number: String(index + 1).padStart(2, "0") }] : [];
  });

  return (
    <>
      <Hero productCount={products.length} />

      <HomeMotion />
      <section className={`section ${styles.ritual}`} data-ritual>
        <div className={`container ${styles.ritualFrame}`}>
          <div className={styles.ritualInner}>
            <div>
              <div className={styles.ritualCopy} data-ritual-copy>
                <p className="eyebrow">The ritual</p>
                <h2 className={styles.ritualTitle}>Heritage care, modern presence</h2>
                <p>
                  A hammam ritual carried forward. Argan, aker fassi, and blue
                  nila — clay and oil kept close to the old way of caring for
                  the skin, generous and by hand.
                </p>
              </div>
              {steps.length > 0 && (
                <ol className={styles.steps} data-steps>
                  {steps.map((step) => (
                    <li key={step.product.id} data-step>
                      <Link href={`/product/${step.product.slug}`}>
                        <span>{step.number}</span>
                        <span>
                          <strong>{step.verb}</strong>
                          {step.product.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className={styles.ritualStage}>
              <div className={styles.arch} data-arch>
                <div className={styles.ritualMark}>
                  <Image
                    src="/brand/logo-brand.png"
                    alt={siteConfig.name}
                    fill
                    sizes="(max-width: 900px) 70vw, 18rem"
                  />
                </div>
                <p className={styles.motto}>From the hammam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BrandFilm />

      <section className="section">
        <div className="container">
          <Reveal>
            <div className={styles.productsHead}>
              <div>
                <p className="eyebrow">Collection</p>
                <h2 className="section-title">{homeCollectionTitle(products.length)}</h2>
              </div>
              <Link href="/shop" className="btn btn-outline">
                View all
              </Link>
            </div>
          </Reveal>
          <div className={styles.grid}>
            {products.map((product) => (
              <Reveal key={product.id}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaBand}>
        <Reveal>
          <p className="eyebrow">Follow the journey</p>
          <h2>Rituals shared on Instagram</h2>
          <p>
            Behind-the-scenes, hammam moments, and new drops — @{siteConfig.instagramHandle}
          </p>
          <div className={styles.ctaActions}>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
            >
              Visit Instagram
            </a>
            <Link href="/shop" className="btn btn-outline">
              Shop now
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
