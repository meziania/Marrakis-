import Link from "next/link";
import { OrderContact } from "../OrderContact";
import { OrderStatusForm } from "../OrderStatusForm";
import { formatPrice } from "@/data/products";
import { getAnalytics, type AnalyticsPeriod } from "@/lib/store";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

const periods: { id: AnalyticsPeriod; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
];

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; saved?: string }>;
}) {
  const { period: rawPeriod, saved } = await searchParams;
  const period: AnalyticsPeriod =
    rawPeriod === "week" || rawPeriod === "month" ? rawPeriod : "all";
  const stats = getAnalytics(period);
  const maxRevenue = Math.max(...stats.products.map((item) => item.revenue), 1);
  const periodLabel = periods.find((item) => item.id === period)?.label ?? "All time";
  const returnTo = period === "all" ? "/admin" : `/admin?period=${period}`;

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Analytics</h1>
        </div>
        <p className={styles.note}>
          Revenue counts confirmed purchases for {periodLabel.toLowerCase()}. Requests stay in the
          list until the house confirms them.
        </p>
      </header>

      {saved === "status" && <p className={styles.notice}>Order updated.</p>}
      {saved === "purchase" && <p className={styles.notice}>Purchase added to the loyalty card.</p>}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {periods.map((item) => (
            <Link
              key={item.id}
              href={item.id === "all" ? "/admin" : `/admin?period=${item.id}`}
              className={period === item.id ? styles.active : ""}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.cards}>
        <article className={styles.card}>
          <span>Revenue</span>
          <strong>{formatPrice(stats.revenue)}</strong>
          <em>{periodLabel}</em>
        </article>
        <article className={styles.card}>
          <span>Orders</span>
          <strong>{stats.orderCount}</strong>
          <em>Confirmed · {periodLabel}</em>
        </article>
        <article className={styles.card}>
          <span>Clients</span>
          <strong>{stats.clientCount}</strong>
          <em>Unique phone numbers</em>
        </article>
        <article className={styles.card}>
          <span>Loyal</span>
          <strong>{stats.loyalCount}</strong>
          <em>
            {stats.settings.loyaltyMinOrders}+ orders or{" "}
            {formatPrice(stats.settings.loyaltyMinSpend)}
          </em>
        </article>
      </div>

      <section className={styles.panel}>
        <h2>Sales by product</h2>
        {stats.products.map((product) => (
          <div className={styles.barRow} key={product.id}>
            <span>{product.name}</span>
            <div className={styles.track}>
              <div
                className={styles.fill}
                style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span>
              {product.units} sold · {formatPrice(product.revenue)}
            </span>
          </div>
        ))}
      </section>

      <section className={`${styles.tableWrap} ${styles.ordersTable}`}>
        <h2>Latest orders</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.length === 0 && (
              <tr>
                <td colSpan={7}>No orders in this period.</td>
              </tr>
            )}
            {stats.recent.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/clients/${order.clientId}`} className={styles.phoneLink}>
                    {order.clientName}
                  </Link>
                </td>
                <td>{order.productName}</td>
                <td>{order.quantity}</td>
                <td>{formatPrice(order.total)}</td>
                <td>{formatWhen(order.createdAt)}</td>
                <td>
                  <OrderStatusForm id={order.id} status={order.status} returnTo={returnTo} />
                </td>
                <td>
                  <OrderContact
                    returnTo={returnTo}
                    order={{
                      id: order.id,
                      productId: order.productId,
                      productName: order.productName,
                      quantity: order.quantity,
                      confirmed: order.confirmed,
                      clientName: order.clientName,
                      clientPhone: order.clientPhone,
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
