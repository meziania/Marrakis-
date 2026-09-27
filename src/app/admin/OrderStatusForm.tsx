"use client";

import { saveOrderStatus } from "@/lib/admin-actions";
import type { OrderStatus } from "@/lib/store";
import styles from "./admin.module.css";

const options: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "prepared", label: "Prepared" },
  { value: "sent", label: "Sent" },
];

export function OrderStatusForm({
  id,
  status,
  returnTo,
}: {
  id: string;
  status: OrderStatus;
  returnTo: string;
}) {
  return (
    <form action={saveOrderStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <select
        className={styles.statusSelect}
        name="status"
        defaultValue={status}
        aria-label="Order status"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}
