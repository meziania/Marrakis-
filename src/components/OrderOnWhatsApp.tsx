"use client";

import Link from "next/link";
import { useState } from "react";
import { LoyaltyCard, type LoyaltySnapshot } from "@/components/LoyaltyCard";
import { formatPrice, type Product } from "@/data/products";
import {
  buildOrderMessage,
  buildWhatsAppOrderUrl,
  loadOrderImages,
} from "@/lib/whatsapp";
import styles from "./OrderOnWhatsApp.module.css";

export function OrderOnWhatsApp({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loyalty, setLoyalty] = useState<LoyaltySnapshot | null>(null);

  async function sendOrder() {
    setError("");
    setSending(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          productId: product.id,
          quantity,
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        loyalty?: LoyaltySnapshot;
      };
      if (!response.ok || !result.ok || !result.loyalty) {
        setError(result.error ?? "Could not save the order.");
        return;
      }

      setLoyalty(result.loyalty);

      const line = {
        name: product.name,
        quantity,
        price: product.price,
        image: product.image,
        slug: product.slug,
      };
      const message = buildOrderMessage([line], window.location.origin);

      try {
        const files = await loadOrderImages([line]);
        const shareData: ShareData = {
          title: `${product.name} — MARRAKISSÉ`,
          text: message,
          files,
        };
        if (files.length > 0 && navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (shareError) {
        if (shareError instanceof DOMException && shareError.name === "AbortError") {
          return;
        }
      }

      window.open(buildWhatsAppOrderUrl(message), "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not save the order.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.order}>
      {loyalty && (
        <div className={styles.cardWrap}>
          <LoyaltyCard {...loyalty} />
        </div>
      )}
      <label className={styles.field}>
        Your name
        <input value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      <label className={styles.field}>
        WhatsApp number
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+971..."
          inputMode="tel"
          required
        />
      </label>
      <div className={styles.qty}>
        <button
          type="button"
          className={styles.qtyBtn}
          aria-label="Decrease quantity"
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
        >
          −
        </button>
        <span>{quantity}</span>
        <button
          type="button"
          className={styles.qtyBtn}
          aria-label="Increase quantity"
          onClick={() => setQuantity((current) => current + 1)}
        >
          +
        </button>
        <span className={styles.total}>{formatPrice(product.price * quantity)}</span>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <button
        type="button"
        className="btn btn-whatsapp"
        disabled={sending}
        onClick={() => {
          void sendOrder();
        }}
      >
        {sending ? "Opening WhatsApp…" : "Order on WhatsApp"}
      </button>
      <p className={styles.hint}>
        Your name and number are sent with the order, then WhatsApp opens.{" "}
        <Link href="/loyalty">Find your card</Link> anytime with the same number.
      </p>
    </div>
  );
}
