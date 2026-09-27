import { NextResponse } from "next/server";
import { getLoyaltyByPhone } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const result = getLoyaltyByPhone(body.phone ?? "");
    if (result.error) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, loyalty: result.loyalty });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not look up the card." }, { status: 400 });
  }
}
