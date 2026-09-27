import { siteConfig, whatsappBaseUrl } from "./config";
import { formatPrice } from "@/data/products";

export type OrderLine = {
  name: string;
  quantity: number;
  price: number;
  image: string;
  slug: string;
};

export function buildOrderMessage(lines: OrderLine[], origin: string): string {
  const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const items = lines
    .map((line, index) => {
      const imageUrl = line.image.startsWith("http")
        ? line.image
        : `${origin}${line.image}`;
      const productUrl = `${origin}/product/${line.slug}`;
      return [
        `${index + 1}. ${line.name}`,
        `   Qty: ${line.quantity}`,
        `   Price: ${formatPrice(line.price * line.quantity)}`,
        `   Image: ${imageUrl}`,
        `   Page: ${productUrl}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `Hello ${siteConfig.name},`,
    "",
    "I would like to place an order:",
    "",
    items,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "Thank you!",
  ].join("\n");
}

export function buildWhatsAppOrderUrl(message: string): string {
  return `${whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
}

export async function loadOrderImages(lines: OrderLine[]): Promise<File[]> {
  const files: File[] = [];

  for (const line of lines) {
    const response = await fetch(line.image);
    if (!response.ok) continue;
    const blob = await response.blob();
    const extension = line.image.split(".").pop() || "jpg";
    files.push(
      new File([blob], `${line.slug}.${extension}`, {
        type: blob.type || "image/jpeg",
      })
    );
  }

  return files;
}
