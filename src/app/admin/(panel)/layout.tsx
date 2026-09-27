import { AdminNav } from "../AdminNav";
import styles from "../admin.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <AdminNav />
      <div className={styles.main}>{children}</div>
    </div>
  );
}
