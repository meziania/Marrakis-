"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/lib/admin-actions";
import styles from "../admin.module.css";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(loginAdmin, { error: "" });

  return (
    <div className={styles.loginScreen}>
      <form className={styles.login} action={action}>
        <p className="eyebrow">MARRAKISSÉ</p>
        <h1>Admin</h1>
        <p>Manage the catalogue, clients, and orders.</p>
        <label>
          Password
          <input name="password" type="password" required autoComplete="current-password" />
        </label>
        {state.error ? <p className={styles.error}>{state.error}</p> : null}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
