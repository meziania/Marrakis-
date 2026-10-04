import { confirmOrderPurchase } from "@/lib/admin-actions";
import { houseMessage, whatsAppHref } from "@/lib/outreach";
import styles from "./admin.module.css";

export function OrderContact({
  order,
  returnTo,
}: {
  order: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    confirmed: boolean;
    clientName: string;
    clientPhone: string;
  };
  returnTo: string;
}) {
  const href = order.clientPhone
    ? whatsAppHref(
        order.clientPhone,
        houseMessage({
          name: order.clientName,
          productId: order.productId,
          productName: order.productName,
          quantity: order.quantity,
        })
      )
    : "";

  return (
    <div className={styles.orderTools}>
      {href ? (
        <a className={styles.waButton} href={href} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      ) : null}
      {order.confirmed ? (
        <span className={styles.onCard}>On the card</span>
      ) : (
        <form action={confirmOrderPurchase}>
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" className={styles.confirmButton}>
            Confirm purchase
          </button>
        </form>
      )}
    </div>
  );
}
