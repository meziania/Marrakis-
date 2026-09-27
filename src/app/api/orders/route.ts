import { NextResponse } from "next/server";
import { recordOrder } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      productId?: string;
      quantity?: number;
    };
    const saved = recordOrder({
      name: body.name ?? "",
      phone: body.phone ?? "",
      productId: body.productId ?? "",
      quantity: body.quantity ?? 1,
    });
    return NextResponse.json({ ok: true, loyalty: saved.loyalty });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save order.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
