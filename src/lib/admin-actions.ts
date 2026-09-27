"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfig } from "@/lib/admin-config";
import {
  addProduct,
  setOrderStatus,
  setProductHidden,
  updateProduct,
  updateSettings,
  type OrderStatus,
} from "@/lib/store";

async function assertAdmin() {
  const jar = await cookies();
  if (jar.get("marrakisse_admin")?.value !== adminConfig.session) {
    redirect("/admin/login");
  }
}

export async function loginAdmin(
  _state: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const password = String(formData.get("password") ?? "");
  if (password !== adminConfig.password) {
    return { error: "Wrong password." };
  }

  const jar = await cookies();
  jar.set("marrakisse_admin", adminConfig.session, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete("marrakisse_admin");
  redirect("/admin/login");
}

async function storeImage(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return "";
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }

  const extension =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const directory = path.join(process.cwd(), "public", "products");
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
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
  updateProduct(String(formData.get("id") ?? ""), {
    name: String(formData.get("name") ?? ""),
    arabicName: String(formData.get("arabicName") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    howToUse: String(formData.get("howToUse") ?? ""),
    image: uploaded || String(formData.get("image") ?? ""),
    price: Number(formData.get("price")),
    benefits: readBenefits(formData),
  });
  refreshShop();
  redirect("/admin/products?saved=updated");
}

export async function createProduct(formData: FormData) {
  await assertAdmin();
  const image = await storeImage(formData);
  addProduct({
    name: String(formData.get("name") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    howToUse: String(formData.get("howToUse") ?? ""),
    benefits: readBenefits(formData),
    price: Number(formData.get("price")),
    image,
    arabicName: String(formData.get("arabicName") ?? ""),
  });
  refreshShop();
  redirect("/admin/products?saved=created");
}

export async function setProductVisibility(formData: FormData) {
  await assertAdmin();
  const hidden = formData.get("hidden") === "1";
  setProductHidden(String(formData.get("id") ?? ""), hidden);
  refreshShop();
  redirect(`/admin/products?saved=${hidden ? "hidden" : "shown"}`);
}

export async function saveOrderStatus(formData: FormData) {
  await assertAdmin();
  const status = String(formData.get("status") ?? "");
  if (status !== "new" && status !== "prepared" && status !== "sent") {
    throw new Error("Unknown status.");
  }
  setOrderStatus(String(formData.get("id") ?? ""), status as OrderStatus);
  redirect(adminReturn(String(formData.get("returnTo") ?? "/admin")));
}

function adminReturn(value: string) {
  const path = value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
  const url = new URL(path, "http://local");
  url.searchParams.set("saved", "status");
  return `${url.pathname}${url.search}`;
}

export async function saveLoyaltySettings(formData: FormData) {
  await assertAdmin();
  updateSettings({
    loyaltyMinOrders: Number(formData.get("loyaltyMinOrders")),
    loyaltyMinSpend: Number(formData.get("loyaltyMinSpend")),
  });
  redirect("/admin/clients?segment=loyal");
}
