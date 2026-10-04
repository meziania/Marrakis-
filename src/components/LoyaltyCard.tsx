import Link from "next/link";
import { formatPrice } from "@/data/products";
import { siteConfig } from "@/lib/config";
import styles from "./LoyaltyCard.module.css";

export type LoyaltySnapshot = {
  name: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
  loyal: boolean;
  minOrders: number;
  minSpend: number;
};

export function LoyaltyCard({
  name,
  phone,
  orderCount,
  totalSpent,
  loyal,
  minOrders,
  minSpend,
  href,
}: LoyaltySnapshot & { href?: string }) {
  const goal = Math.max(1, minOrders);
  const slots = Math.min(goal, 8);
  const filled = Math.min(orderCount, slots);
  const className = loyal ? `${styles.card} ${styles.loyal}` : styles.card;
  const body = (
    <>
      <div className={styles.top}>
        <span>{siteConfig.name}</span>
        <span className={styles.arabic}>{siteConfig.nameArabic}</span>
      </div>
      <p className={styles.kicker}>Loyalty card</p>
      <h2>{name}</h2>
      <p className={styles.phone}>+{phone}</p>
      <div className={styles.stamps} aria-hidden="true">
        {Array.from({ length: slots }, (_, index) => (
          <span key={index} className={index < filled ? styles.stampOn : styles.stamp} />
        ))}
      </div>
      <p className={styles.meta}>
        {orderCount} / {goal} orders · {formatPrice(totalSpent)} of {formatPrice(minSpend)}
      </p>
      <p className={styles.foot}>
        {orderCount === 0 ? "Awaiting the house" : loyal ? "Loyal member" : "Collecting stamps"}
      </p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}
