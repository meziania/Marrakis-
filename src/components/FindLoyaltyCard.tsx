"use client";

import { useState } from "react";
import { LoyaltyCard, type LoyaltySnapshot } from "@/components/LoyaltyCard";
import styles from "./FindLoyaltyCard.module.css";

export function FindLoyaltyCard() {
  const [phone, setPhone] = useState("");
  const [loyalty, setLoyalty] = useState<LoyaltySnapshot | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function lookup(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setLoyalty(null);

    try {
      const response = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        error?: string;
        loyalty: LoyaltySnapshot | null;
      };
      if (!response.ok || !result.ok) {
        setMessage(result.error ?? "Could not look up the card.");
        return;
      }
      if (!result.loyalty) {
        setMessage(
          "No card yet for this number. It appears after the house confirms your first purchase."
        );
        return;
      }
      setLoyalty(result.loyalty);
    } catch {
      setMessage("Could not look up the card.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={(event) => void lookup(event)}>
        <label>
          WhatsApp number
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+971..."
            inputMode="tel"
            required
          />
        </label>
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Looking…" : "Show my card"}
        </button>
      </form>
      {message && <p className={styles.message}>{message}</p>}
      {loyalty && (
        <div className={styles.card}>
          <LoyaltyCard {...loyalty} />
        </div>
      )}
    </div>
  );
}
