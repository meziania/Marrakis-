import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getLoyaltyByPhone } from "@/lib/store";

export async function POST(request: Request) {
  const ip = clientIp(request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip"));
  if (!rateLimit(`loyalty:${ip}`, 30, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Too many lookups. Try again shortly." },
      { status: 429 }
    );
  }

  try {
    const body = (await request.json()) as { phone?: string };
    const result = await getLoyaltyByPhone(body.phone ?? "");
    if (result.error) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, loyalty: result.loyalty });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not look up the card." }, { status: 400 });
  }
}
