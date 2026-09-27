import type { Metadata } from "next";
import { FindLoyaltyCard } from "@/components/FindLoyaltyCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Loyalty",
  description: "Find your MARRAKISSÉ loyalty card with the phone number used to order.",
};

export default function LoyaltyPage() {
  return (
    <div className={`container ${styles.page}`}>
      <p className="eyebrow">Loyalty</p>
      <h1 className="section-title">Your card</h1>
      <p className={styles.lead}>
        Enter the WhatsApp number you used to order. No account needed.
      </p>
      <FindLoyaltyCard />
    </div>
  );
}
