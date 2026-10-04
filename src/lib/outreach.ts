import { siteConfig } from "@/lib/config";

const ritualLines: Record<string, string> = {
  "aker-fassi-nila":
    "Take it by the palm, in warm water. The clay is meant to leave the skin soft, never dry.",
  ghassoul:
    "A short clay ritual for hair and body: it lifts the oil and leaves everything light.",
  "nila-bleu":
    "A little blue nila on damp skin. It is the quiet glow at the end of a hammam.",
};

export function houseMessage(input: {
  name: string;
  productId: string;
  productName: string;
  quantity: number;
}) {
  const first = input.name.trim().split(/\s+/)[0] || "there";
  const jar =
    input.quantity === 1 ? input.productName : `${input.quantity} × ${input.productName}`;
  const ritual =
    ritualLines[input.productId] ??
    "I’ll walk you through it the way we do it in the hammam.";

  return [
    `Hello ${first}, this is the ${siteConfig.name} house.`,
    `${jar} is set aside for you. ${ritual}`,
    "Reply with your city and I’ll confirm delivery with you personally.",
  ].join(" ");
}

export function whatsAppHref(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
