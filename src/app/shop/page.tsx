import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { shopIntro } from "@/lib/collection";
import { getVisibleProducts } from "@/lib/store";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop MARRAKISSE Moroccan hammam essentials.",
};

export default async function ShopPage() {
  const products = await getVisibleProducts();

  return (
    <div className={`container ${styles.page}`}>
      <Reveal className={styles.head}>
        <p className="eyebrow">Shop</p>
        <h1 className="section-title">The collection</h1>
        <p className="muted" style={{ marginTop: "0.85rem" }}>
          {shopIntro(products.length)}
        </p>
      </Reveal>
      <div className={styles.grid}>
        {products.map((product) => (
          <Reveal key={product.id}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
