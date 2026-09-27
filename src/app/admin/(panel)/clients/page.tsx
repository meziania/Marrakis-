import Link from "next/link";
import { LoyaltyCard } from "../../LoyaltyCard";
import { formatPrice } from "@/data/products";
import { saveLoyaltySettings } from "@/lib/admin-actions";
import { readStore, summarizeClients } from "@/lib/store";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string; q?: string }>;
}) {
  const { segment = "all", q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const queryDigits = query.replace(/\D/g, "");
  const store = readStore();
  const all = summarizeClients(store);
  const clients = all.filter((client) => {
    if (segment === "loyal" && !client.loyal) return false;
    if (segment === "new" && client.loyal) return false;
    if (!query) return true;
    const nameMatch = client.name.toLowerCase().includes(query);
    const phoneMatch =
      client.phone.includes(query) ||
      (queryDigits.length > 0 && client.phone.includes(queryDigits));
    return nameMatch || phoneMatch;
  });
  const loyalCount = all.filter((client) => client.loyal).length;
  const cardClients = clients.filter((client) => client.orderCount > 0);

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Customers</p>
          <h1>Clients</h1>
        </div>
        <p className={styles.note}>
          {loyalCount} loyal of {all.length}. A client becomes loyal at{" "}
          {store.settings.loyaltyMinOrders}+ orders or{" "}
          {formatPrice(store.settings.loyaltyMinSpend)} spent.
        </p>
      </header>

      <form className={styles.settings} action={saveLoyaltySettings}>
        <label>
          Minimum orders
          <input
            name="loyaltyMinOrders"
            type="number"
            min={1}
            defaultValue={store.settings.loyaltyMinOrders}
          />
        </label>
        <label>
          Or minimum spend (DH)
          <input
            name="loyaltyMinSpend"
            type="number"
            min={0}
            defaultValue={store.settings.loyaltyMinSpend}
          />
        </label>
        <button className="btn btn-outline" type="submit">
          Update rule
        </button>
      </form>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Link href={clientHref(undefined, query)} className={segment === "all" ? styles.active : ""}>
            All {all.length}
          </Link>
          <Link
            href={clientHref("loyal", query)}
            className={segment === "loyal" ? styles.active : ""}
          >
            Loyal {loyalCount}
          </Link>
          <Link
            href={clientHref("new", query)}
            className={segment === "new" ? styles.active : ""}
          >
            New {all.length - loyalCount}
          </Link>
        </div>
        <form className={styles.search} action="/admin/clients">
          {segment !== "all" && <input type="hidden" name="segment" value={segment} />}
          <input name="q" defaultValue={q} placeholder="Name or phone" />
        </form>
      </div>

      {cardClients.length > 0 && (
        <section className={styles.loyaltySection}>
          <h2>Loyalty cards</h2>
          <div className={styles.loyaltyGrid}>
            {cardClients.map((client) => (
              <LoyaltyCard
                key={client.id}
                client={client}
                minOrders={store.settings.loyaltyMinOrders}
                minSpend={store.settings.loyaltyMinSpend}
                href={`/admin/clients/${client.id}`}
              />
            ))}
          </div>
        </section>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th>
              <th>Phone</th>
              <th>Orders</th>
              <th>Spent</th>
              <th>Last order</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={6}>
                  {query ? "No clients match this search." : "No clients in this view yet."}
                </td>
              </tr>
            )}
            {clients.map((client) => (
              <tr key={client.id}>
                <td>
                  <Link href={`/admin/clients/${client.id}`} className={styles.person}>
                    <span className={styles.avatar}>{client.name.slice(0, 1)}</span>
                    {client.name}
                  </Link>
                </td>
                <td>
                  <a
                    className={styles.phoneLink}
                    href={`https://wa.me/${client.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +{client.phone}
                  </a>
                </td>
                <td>{client.orderCount}</td>
                <td>{formatPrice(client.totalSpent)}</td>
                <td>{formatWhen(client.lastOrderAt)}</td>
                <td>
                  {client.loyal ? (
                    <span className={styles.badge}>Loyal</span>
                  ) : (
                    <span className={styles.quiet}>New</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function clientHref(segment?: string, query?: string) {
  const params = new URLSearchParams();
  if (segment) params.set("segment", segment);
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/admin/clients?${search}` : "/admin/clients";
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
