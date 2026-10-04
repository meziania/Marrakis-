"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  adminEnvReady,
  adminSessionMaxAge,
  createSessionToken,
  passwordsMatch,
  verifySessionToken,
} from "@/lib/admin-session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  addProduct,
  confirmPurchase as markPurchaseConfirmed,
  setOrderStatus,
  setProductHidden,
  updateProduct,
  updateSettings,
  type OrderStatus,
} from "@/lib/store";

async function assertAdmin() {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(ADMIN_COOKIE)?.value))) {
    redirect("/admin/login");
  }
}

export async function loginAdmin(
  _state: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const headerStore = await headers();
  const ip = clientIp(headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip"));
  if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
    return { error: "Too many attempts. Wait a few minutes." };
  }

  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEnvReady()) {
    console.error("Admin login is locked until ADMIN_PASSWORD and ADMIN_SECRET are set.");
  }
  if (!(await passwordsMatch(password, expected))) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { error: "Wrong password." };
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: adminSessionMaxAge,
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

function imageKind(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return "";
}

function safeProductImage(value: string) {
  return /^\/products\/[A-Za-z0-9._-]+$/.test(value) ? value : "";
}

function clip(value: FormDataEntryValue | null, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

async function storeImage(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return "";
  if (file.size > 5 * 1024 * 1024) throw new Error("Image is too large.");

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = imageKind(bytes);
  if (!extension) throw new Error("Choose a JPG, PNG, or WebP image.");

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const directory = path.join(process.cwd(), "public", "products");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, filename), bytes);
  return `/products/${filename}`;
}

function readBenefits(formData: FormData) {
  return String(formData.get("benefits") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function refreshShop() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function saveProduct(formData: FormData) {
  await assertAdmin();
  const uploaded = await storeImage(formData);
  await updateProduct(String(formData.get("id") ?? "").slice(0, 80), {
    name: clip(formData.get("name"), 120),
    arabicName: clip(formData.get("arabicName"), 120),
    subtitle: clip(formData.get("subtitle"), 160),
    tagline: clip(formData.get("tagline"), 180),
    description: clip(formData.get("description"), 4000),
    howToUse: clip(formData.get("howToUse"), 1000),
    image: uploaded || safeProductImage(String(formData.get("image") ?? "")),
    price: Number(formData.get("price")),
    benefits: readBenefits(formData).slice(0, 12).map((line) => line.slice(0, 180)),
  });
  refreshShop();
  redirect("/admin/products?saved=updated");
}

export async function createProduct(formData: FormData) {
  await assertAdmin();
  const image = await storeImage(formData);
  await addProduct({
    name: clip(formData.get("name"), 120),
    subtitle: clip(formData.get("subtitle"), 160),
    tagline: clip(formData.get("tagline"), 180),
    description: clip(formData.get("description"), 4000),
    howToUse: clip(formData.get("howToUse"), 1000),
    benefits: readBenefits(formData).slice(0, 12).map((line) => line.slice(0, 180)),
    price: Number(formData.get("price")),
    image,
    arabicName: clip(formData.get("arabicName"), 120),
  });
  refreshShop();
  redirect("/admin/products?saved=created");
}

export async function setProductVisibility(formData: FormData) {
  await assertAdmin();
  const hidden = formData.get("hidden") === "1";
  await setProductHidden(String(formData.get("id") ?? ""), hidden);
  refreshShop();
  redirect(`/admin/products?saved=${hidden ? "hidden" : "shown"}`);
}

export async function saveOrderStatus(formData: FormData) {
  await assertAdmin();
  const status = String(formData.get("status") ?? "");
  if (status !== "new" && status !== "prepared" && status !== "sent") {
    throw new Error("Unknown status.");
  }
  await setOrderStatus(String(formData.get("id") ?? ""), status as OrderStatus);
  redirect(adminReturn(String(formData.get("returnTo") ?? "/admin")));
}

export async function confirmOrderPurchase(formData: FormData) {
  await assertAdmin();
  await markPurchaseConfirmed(String(formData.get("id") ?? ""));
  redirect(adminReturn(String(formData.get("returnTo") ?? "/admin"), "purchase"));
}

function adminReturn(value: string, saved = "status") {
  const path = value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
  const url = new URL(path, "http://local");
  url.searchParams.set("saved", saved);
  return `${url.pathname}${url.search}`;
}

export async function saveLoyaltySettings(formData: FormData) {
  await assertAdmin();
  await updateSettings({
    loyaltyMinOrders: Number(formData.get("loyaltyMinOrders")),
    loyaltyMinSpend: Number(formData.get("loyaltyMinSpend")),
  });
  redirect("/admin/clients?segment=loyal");
}
