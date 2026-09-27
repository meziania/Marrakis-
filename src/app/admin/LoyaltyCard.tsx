import { LoyaltyCard as Card } from "@/components/LoyaltyCard";
import type { ClientSummary } from "@/lib/store";

export function LoyaltyCard({
  client,
  minOrders,
  minSpend,
  href,
}: {
  client: ClientSummary;
  minOrders: number;
  minSpend: number;
  href?: string;
}) {
  return (
    <Card
      name={client.name}
      phone={client.phone}
      orderCount={client.orderCount}
      totalSpent={client.totalSpent}
      loyal={client.loyal}
      minOrders={minOrders}
      minSpend={minSpend}
      href={href}
    />
  );
}
