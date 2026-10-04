import fs from "fs";
import path from "path";
import { get, put, BlobNotFoundError } from "@vercel/blob";
import { products as seedProducts, type Product } from "@/data/products";
import bundledStore from "../../data/store.json";

export type Client = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
};

export type OrderStatus = "new" | "prepared" | "sent";

export type Order = {
  id: string;
  clientId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  status: OrderStatus;
  email: string;
  phone: string;
  confirmed: boolean;
};

export type AnalyticsPeriod = "all" | "week" | "month";

export type Settings = {
  loyaltyMinOrders: number;
  loyaltyMinSpend: number;
};

export type StoreData = {
  products: Product[];
  clients: Client[];
  orders: Order[];
  settings: Settings;
};

export type ClientSummary = Client & {
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  loyal: boolean;
  pendingCount: number;
};

const bundledPath = path.join(process.cwd(), "data", "store.json");
const remotePath = "marrakisse-store.json";

function useRemoteStore() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

let memory: StoreData | null = null;

function emptyStore(): StoreData {
  return {
    products: seedProducts,
    clients: [],
    orders: [],
    settings: {
      loyaltyMinOrders: 2,
      loyaltyMinSpend: 300,
    },
  };
}

function normalize(parsed: Partial<StoreData> | null | undefined): StoreData {
  return {
    products: parsed?.products?.length ? parsed.products : seedProducts,
    clients: parsed?.clients ?? [],
    orders: (parsed?.orders ?? []).map((order) => ({
      ...order,
      status: normalizeStatus(order.status),
      email: order.email ?? "",
      phone: order.phone ?? "",
      confirmed: order.confirmed === true,
    })),
    settings: {
      loyaltyMinOrders: parsed?.settings?.loyaltyMinOrders ?? 2,
      loyaltyMinSpend: parsed?.settings?.loyaltyMinSpend ?? 300,
    },
  };
}

function readFileStore(file: string): StoreData | null {
  try {
    if (!fs.existsSync(file)) return null;
    return normalize(JSON.parse(fs.readFileSync(file, "utf8")) as StoreData);
  } catch {
    return null;
  }
}

function loadLocal(): StoreData {
  return (
    readFileStore(bundledPath) ??
    normalize(bundledStore as StoreData) ??
    emptyStore()
  );
}

async function readRemote(): Promise<StoreData | null> {
  try {
    const result = await get(remotePath, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const text = await new Response(result.stream).text();
    return normalize(JSON.parse(text) as StoreData);
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

async function writeRemote(store: StoreData) {
  await put(remotePath, JSON.stringify(store), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
}

export async function readStore(): Promise<StoreData> {
  if (useRemoteStore()) {
    const remote = await readRemote();
    if (remote) return remote;
    const seeded = normalize(bundledStore as StoreData);
    await writeRemote(seeded);
    return seeded;
  }
  if (!memory) memory = loadLocal();
  return JSON.parse(JSON.stringify(memory)) as StoreData;
}

export async function writeStore(store: StoreData) {
  if (useRemoteStore()) {
    await writeRemote(store);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error("Order storage is not configured.");
  }
  memory = store;
  try {
    fs.mkdirSync(path.dirname(bundledPath), { recursive: true });
    fs.writeFileSync(bundledPath, JSON.stringify(store, null, 2));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "EROFS" && code !== "EACCES" && code !== "ENOENT") throw error;
  }
}

export async function getProducts(): Promise<Product[]> {
  return (await readStore()).products;
}

export async function getVisibleProducts(): Promise<Product[]> {
  return (await getProducts()).filter((product) => !product.hidden);
}

export async function getProductFromStore(slug: string): Promise<Product | undefined> {
  return (await getVisibleProducts()).find((product) => product.slug === slug);
}

export function isLoyal(
  orderCount: number,
  totalSpent: number,
  settings: Settings
) {
  return (
    orderCount >= settings.loyaltyMinOrders ||
    totalSpent >= settings.loyaltyMinSpend
  );
}

export function summarizeClients(store: StoreData): ClientSummary[] {
  return store.clients
    .map((client) => {
      const orders = store.orders.filter((order) => order.clientId === client.id);
      const confirmed = orders.filter((order) => order.confirmed);
      const totalSpent = confirmed.reduce((sum, order) => sum + order.total, 0);
      const lastOrderAt = orders.reduce<string | null>((latest, order) => {
        if (!latest || order.createdAt > latest) return order.createdAt;
        return latest;
      }, null);

      return {
        ...client,
        orderCount: confirmed.length,
        totalSpent,
        lastOrderAt,
        loyal: isLoyal(confirmed.length, totalSpent, store.settings),
        pendingCount: orders.length - confirmed.length,
      };
    })
    .sort((a, b) => (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? ""));
}

export async function getLoyaltyByPhone(phoneInput: string) {
  const phone = digits(phoneInput);
  if (phone.length < 8 || phone.length > 15) {
    return { error: "Enter a valid phone number." as const, loyalty: null };
  }

  const store = await readStore();
  const summary = summarizeClients(store).find((client) => client.phone === phone);
  if (!summary || (summary.orderCount < 1 && summary.pendingCount < 1)) {
    return { error: null, loyalty: null };
  }

  return {
    error: null,
    loyalty: {
      name: summary.name,
      phone: summary.phone,
      orderCount: summary.orderCount,
      totalSpent: summary.totalSpent,
      loyal: summary.loyal,
      minOrders: store.settings.loyaltyMinOrders,
      minSpend: store.settings.loyaltyMinSpend,
    },
  };
}

export async function getAnalytics(period: AnalyticsPeriod = "all", store?: StoreData) {
  const data = store ?? (await readStore());
  const clients = summarizeClients(data);
  const orders = ordersInPeriod(data.orders, period);
  const confirmed = orders.filter((order) => order.confirmed);
  const revenue = confirmed.reduce((sum, order) => sum + order.total, 0);

  return {
    revenue,
    orderCount: confirmed.length,
    clientCount: clients.length,
    loyalCount: clients.filter((client) => client.loyal).length,
    settings: data.settings,
    products: data.products.map((product) => {
      const productOrders = confirmed.filter((order) => order.productId === product.id);
      return {
        id: product.id,
        name: product.name,
        orders: productOrders.length,
        units: productOrders.reduce((sum, order) => sum + order.quantity, 0),
        revenue: productOrders.reduce((sum, order) => sum + order.total, 0),
      };
    }),
    recent: [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 12)
      .map((order) => ({
        ...order,
        clientName:
          data.clients.find((client) => client.id === order.clientId)?.name ??
          "Client",
        clientPhone:
          order.phone ||
          data.clients.find((client) => client.id === order.clientId)?.phone ||
          "",
      })),
  };
}

function normalizeStatus(status: string | undefined): OrderStatus {
  if (status === "prepared" || status === "sent") return status;
  return "new";
}

function startOfWeek(now: Date) {
  const day = now.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
}

export function ordersInPeriod(orders: Order[], period: AnalyticsPeriod, now = new Date()) {
  if (period === "all") return orders;
  const start =
    period === "month"
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : startOfWeek(now);
  return orders.filter((order) => new Date(order.createdAt) >= start);
}

function digits(value: string) {
  return value.replace(/\D/g, "");
}

export async function recordOrder(input: {
  name: string;
  phone: string;
  email: string;
  productId: string;
  quantity: number;
}) {
  const name = input.name.trim().slice(0, 80);
  const phone = digits(input.phone).slice(0, 15);
  const email = input.email.trim().toLowerCase().slice(0, 120);
  const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));

  if (name.length < 2) throw new Error("Enter your name.");
  if (phone.length < 8) throw new Error("Enter a valid phone number.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
  if (quantity > 20) throw new Error("Quantity is too high.");
  if (!/^[a-z0-9-]{1,80}$/i.test(input.productId)) throw new Error("Product not found.");

  const store = await readStore();
  const product = store.products.find((item) => item.id === input.productId);
  if (!product || product.hidden) throw new Error("Product not found.");

  let client = store.clients.find((item) => item.phone === phone);
  if (!client) {
    client = {
      id: `client-${Date.now()}`,
      name,
      phone,
      email,
      createdAt: new Date().toISOString(),
    };
    store.clients.push(client);
  } else {
    client.name = name;
    client.email = email;
  }

  const order: Order = {
    id: `order-${Date.now()}`,
    clientId: client.id,
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    quantity,
    unitPrice: product.price,
    total: product.price * quantity,
    createdAt: new Date().toISOString(),
    status: "new",
    email,
    phone,
    confirmed: false,
  };
  store.orders.push(order);
  await writeStore(store);

  const summary = summarizeClients(store).find((item) => item.id === client.id);
  return {
    order,
    loyalty: {
      name: summary?.name ?? client.name,
      phone: summary?.phone ?? client.phone,
      orderCount: summary?.orderCount ?? 0,
      totalSpent: summary?.totalSpent ?? 0,
      loyal: summary?.loyal ?? false,
      minOrders: store.settings.loyaltyMinOrders,
      minSpend: store.settings.loyaltyMinSpend,
    },
  };
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || `product-${Date.now()}`;
}

export async function addProduct(input: {
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  howToUse: string;
  benefits: string[];
  price: number;
  image: string;
  arabicName?: string;
}) {
  const name = input.name.trim();
  if (!name) throw new Error("Enter a product name.");
  if (!input.image) throw new Error("Add a product image.");

  const store = await readStore();
  let slug = slugify(name);
  if (store.products.some((product) => product.slug === slug)) {
    slug = `${slug}-${Date.now()}`;
  }

  store.products.push({
    id: `product-${Date.now()}`,
    slug,
    name,
    arabicName: input.arabicName?.trim() || undefined,
    subtitle: input.subtitle.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    howToUse: input.howToUse.trim(),
    benefits: input.benefits.filter(Boolean),
    price: Math.max(0, input.price),
    image: input.image,
    accent: "#0d5c75",
  });
  await writeStore(store);
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const store = await readStore();
  const product = store.products.find((item) => item.id === id);
  if (!product) throw new Error("Product not found.");

  if (patch.name !== undefined) product.name = patch.name.trim() || product.name;
  if (patch.arabicName !== undefined) {
    product.arabicName = patch.arabicName.trim() || undefined;
  }
  if (patch.subtitle !== undefined) product.subtitle = patch.subtitle;
  if (patch.tagline !== undefined) product.tagline = patch.tagline;
  if (patch.description !== undefined) product.description = patch.description;
  if (patch.howToUse !== undefined) product.howToUse = patch.howToUse;
  if (patch.price !== undefined && Number.isFinite(patch.price)) {
    product.price = Math.max(0, patch.price);
  }
  if (patch.benefits) product.benefits = patch.benefits.filter(Boolean);
  if (patch.image && /^\/products\/[A-Za-z0-9._-]+$/.test(patch.image)) {
    product.image = patch.image;
  }
  if (patch.hidden !== undefined) product.hidden = patch.hidden;

  await writeStore(store);
}

export async function setProductHidden(id: string, hidden: boolean) {
  await updateProduct(id, { hidden });
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const store = await readStore();
  const order = store.orders.find((item) => item.id === id);
  if (!order) throw new Error("Order not found.");
  order.status = status;
  await writeStore(store);
}

export async function confirmPurchase(id: string) {
  const store = await readStore();
  const order = store.orders.find((item) => item.id === id);
  if (!order) throw new Error("Order not found.");
  order.confirmed = true;
  await writeStore(store);
}

export async function updateSettings(settings: Settings) {
  const store = await readStore();
  store.settings = {
    loyaltyMinOrders: Math.max(1, Math.floor(settings.loyaltyMinOrders) || 1),
    loyaltyMinSpend: Math.max(0, Math.floor(settings.loyaltyMinSpend) || 0),
  };
  await writeStore(store);
}
