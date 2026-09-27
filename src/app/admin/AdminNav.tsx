"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/lib/admin-actions";
import styles from "./admin.module.css";

const links = [
  { href: "/admin", label: "Analytics", exact: true },
  { href: "/admin/products", label: "Products", exact: false },
  { href: "/admin/clients", label: "Clients", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div>
        <p className={styles.kicker}>Studio</p>
        <Link href="/admin" className={styles.brand}>
          MARRAKISSÉ
        </Link>
        <p className={styles.brandNote}>Orders, clients, catalogue</p>
      </div>

      <nav className={styles.nav} aria-label="Admin">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? styles.navActive : styles.navLink}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sideFoot}>
        <Link href="/" className={styles.sideLink}>
          View shop
        </Link>
        <form action={logoutAdmin}>
          <button className={styles.logout} type="submit">
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
