import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/data/products";
import styles from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className={styles.card}>
      <div className={styles.media}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 700px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={styles.meta}>
        <p className={styles.subtitle}>{product.subtitle}</p>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
