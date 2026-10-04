"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, type Product } from "@/data/products";
import { siteConfig } from "@/lib/config";
import styles from "./OrderOnWhatsApp.module.css";

export function OrderOnWhatsApp({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [received, setReceived] = useState(false);

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
          email,
          productId: product.id,
          quantity,
        }),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setError(result.error ?? "Could not save the order.");
        return;
      }
      setReceived(true);
    } catch {
      setError("Could not save the order.");
    } finally {
      setSending(false);
    }
  }

  if (received) {
    return (
      <div className={styles.received} role="status">
        <p className={styles.receivedKicker}>{siteConfig.name}</p>
        <h2>Your request is with the house.</h2>
        <p>
          A house advisor will contact you on WhatsApp to confirm {product.name}. Your loyalty
          card receives a stamp only after that confirmation.
        </p>
        <Link href="/loyalty" className="btn btn-outline">
          Find your card
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.order}>
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
      <label className={styles.field}>
        Email
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
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
          onClick={() => setQuantity((current) => Math.min(20, current + 1))}
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
        {sending ? "Sending…" : "Request the ritual"}
      </button>
      <p className={styles.hint}>
        The house keeps your name, number, and email, then a house advisor writes to you on
        WhatsApp. <Link href="/loyalty">Find your card</Link> with the same number after the
        purchase is confirmed.
      </p>
    </div>
  );
}
