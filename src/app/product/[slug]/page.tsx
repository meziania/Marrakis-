import Image from "next/image";
import { notFound } from "next/navigation";
import { OrderOnWhatsApp } from "@/components/OrderOnWhatsApp";
import { TiltPhoto } from "@/components/TiltPhoto";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice, products } from "@/data/products";
import { getProductFromStore, getVisibleProducts } from "@/lib/store";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductFromStore(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductFromStore(slug);
  if (!product) notFound();
  const others = getVisibleProducts().filter((item) => item.id !== product.id);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.layout}>
        <div className={styles.media}>
          <TiltPhoto className={styles.tilt}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </TiltPhoto>
        </div>

        <div>
          <p className="eyebrow">{product.subtitle}</p>
          <h1 className="section-title">{product.name}</h1>
          {product.arabicName && (
            <p className={styles.arabic}>{product.arabicName}</p>
          )}
          <p className={styles.tagline}>{product.tagline}</p>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <p className={styles.description}>{product.description}</p>

          {product.benefits.length > 0 && (
            <div className={styles.block}>
              <h2>Benefits</h2>
              <ul className={styles.benefits}>
                {product.benefits.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {product.howToUse && (
            <div className={styles.block}>
              <h2>How to use</h2>
              <p className="muted">{product.howToUse}</p>
            </div>
          )}

          <OrderOnWhatsApp product={product} />
        </div>
      </div>

      {others.length > 0 && (
        <section className={styles.related}>
          <h2 className="section-title">Also in the collection</h2>
          <div className={styles.relatedGrid}>
            {others.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
