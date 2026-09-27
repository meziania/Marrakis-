import fs from "fs";
import path from "path";
import { products as seedProducts, type Product } from "@/data/products";

export type Client = {
  id: string;
  name: string;
  phone: string;
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
};

const filePath = path.join(process.cwd(), "data", "store.json");

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

export function readStore(): StoreData {
  if (!fs.existsSync(filePath)) {
    const initial = emptyStore();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2));
    return initial;
  }

  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as StoreData;
  return {
    products: parsed.products?.length ? parsed.products : seedProducts,
    clients: parsed.clients ?? [],
    orders: (parsed.orders ?? []).map((order) => ({
      ...order,
      status: normalizeStatus(order.status),
    })),
    settings: {
      loyaltyMinOrders: parsed.settings?.loyaltyMinOrders ?? 2,
      loyaltyMinSpend: parsed.settings?.loyaltyMinSpend ?? 300,
    },
  };
}

export function writeStore(store: StoreData) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
}

export function getProducts(): Product[] {
  return readStore().products;
}

export function getVisibleProducts(): Product[] {
  return getProducts().filter((product) => !product.hidden);
}

export function getProductFromStore(slug: string): Product | undefined {
  return getVisibleProducts().find((product) => product.slug === slug);
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

export function summarizeClients(store = readStore()): ClientSummary[] {
  return store.clients
    .map((client) => {
      const orders = store.orders.filter((order) => order.clientId === client.id);
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      const lastOrderAt = orders.reduce<string | null>((latest, order) => {
        if (!latest || order.createdAt > latest) return order.createdAt;
        return latest;
      }, null);

      return {
        ...client,
        orderCount: orders.length,
        totalSpent,
        lastOrderAt,
        loyal: isLoyal(orders.length, totalSpent, store.settings),
      };
    })
    .sort((a, b) => (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? ""));
}

export function getLoyaltyByPhone(phoneInput: string) {
  const phone = digits(phoneInput);
  if (phone.length < 8) {
    return { error: "Enter a valid phone number." as const, loyalty: null };
  }

  const store = readStore();
  const summary = summarizeClients(store).find((client) => client.phone === phone);
  if (!summary || summary.orderCount < 1) {
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

export function getAnalytics(period: AnalyticsPeriod = "all", store = readStore()) {
  const clients = summarizeClients(store);
  const orders = ordersInPeriod(store.orders, period);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  return {
    revenue,
    orderCount: orders.length,
    clientCount: clients.length,
    loyalCount: clients.filter((client) => client.loyal).length,
    settings: store.settings,
    products: store.products.map((product) => {
      const productOrders = orders.filter((order) => order.productId === product.id);
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
          store.clients.find((client) => client.id === order.clientId)?.name ??
          "Client",
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

export function recordOrder(input: {
  name: string;
  phone: string;
  productId: string;
  quantity: number;
}) {
  const name = input.name.trim();
  const phone = digits(input.phone);
  const quantity = Math.max(1, Math.floor(Number(input.quantity) || 1));

  if (name.length < 2) throw new Error("Enter your name.");
  if (phone.length < 8) throw new Error("Enter a valid phone number.");

  const store = readStore();
  const product = store.products.find((item) => item.id === input.productId);
  if (!product || product.hidden) throw new Error("Product not found.");

  let client = store.clients.find((item) => item.phone === phone);
  if (!client) {
    client = {
      id: `client-${Date.now()}`,
      name,
      phone,
      createdAt: new Date().toISOString(),
    };
    store.clients.push(client);
  } else {
    client.name = name;
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
  };
  store.orders.push(order);
  writeStore(store);

  const summary = summarizeClients(store).find((item) => item.id === client.id);
  return {
    order,
    loyalty: {
      name: summary?.name ?? client.name,
      phone: summary?.phone ?? client.phone,
      orderCount: summary?.orderCount ?? 1,
      totalSpent: summary?.totalSpent ?? order.total,
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

export function addProduct(input: {
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

  const store = readStore();
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
  writeStore(store);
}

export function updateProduct(id: string, patch: Partial<Product>) {
  const store = readStore();
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
  if (patch.image) product.image = patch.image;
  if (patch.hidden !== undefined) product.hidden = patch.hidden;

  writeStore(store);
}

export function setProductHidden(id: string, hidden: boolean) {
  updateProduct(id, { hidden });
}

export function setOrderStatus(id: string, status: OrderStatus) {
  const store = readStore();
  const order = store.orders.find((item) => item.id === id);
  if (!order) throw new Error("Order not found.");
  order.status = status;
  writeStore(store);
}

export function updateSettings(settings: Settings) {
  const store = readStore();
  store.settings = {
    loyaltyMinOrders: Math.max(1, Math.floor(settings.loyaltyMinOrders) || 1),
    loyaltyMinSpend: Math.max(0, Math.floor(settings.loyaltyMinSpend) || 0),
  };
  writeStore(store);
}
