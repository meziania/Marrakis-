import Link from "next/link";
import { notFound } from "next/navigation";
import { LoyaltyCard } from "../../../LoyaltyCard";
import { OrderStatusForm } from "../../../OrderStatusForm";
import { formatPrice } from "@/data/products";
import { readStore, summarizeClients } from "@/lib/store";
import styles from "../../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const store = readStore();
  const client = summarizeClients(store).find((item) => item.id === id);
  if (!client) notFound();

  const orders = store.orders
    .filter((order) => order.clientId === client.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const returnTo = `/admin/clients/${client.id}`;

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Customer</p>
          <h1>{client.name}</h1>
        </div>
        <p className={styles.note}>
          {client.orderCount} orders · {formatPrice(client.totalSpent)}
        </p>
      </header>

      {saved === "status" && <p className={styles.notice}>Order updated.</p>}

      {client.orderCount > 0 && (
        <div className={styles.loyaltySolo}>
          <LoyaltyCard
            client={client}
            minOrders={store.settings.loyaltyMinOrders}
            minSpend={store.settings.loyaltyMinSpend}
          />
        </div>
      )}

      <div className={styles.toolbar}>
        <Link href="/admin/clients" className="btn btn-outline">
          All clients
        </Link>
        <a
          className="btn btn-primary"
          href={`https://wa.me/${client.phone}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>

      <div className={styles.cards}>
        <article className={styles.card}>
          <span>Phone</span>
          <strong className={styles.cardPhone}>+{client.phone}</strong>
        </article>
        <article className={styles.card}>
          <span>Last order</span>
          <strong className={styles.cardDate}>{formatWhen(client.lastOrderAt)}</strong>
        </article>
        <article className={styles.card}>
          <span>Status</span>
          <strong className={styles.cardDate}>{client.loyal ? "Loyal" : "New"}</strong>
        </article>
      </div>

      <section className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5}>No orders yet.</td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.productName}</td>
                <td>{order.quantity}</td>
                <td>{formatPrice(order.total)}</td>
                <td>{formatWhen(order.createdAt)}</td>
                <td>
                  <OrderStatusForm id={order.id} status={order.status} returnTo={returnTo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
