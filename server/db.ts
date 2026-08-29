import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertProduct,
  InsertTicket,
  InsertUser,
  products,
  tickets,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

const defaultProducts: InsertProduct[] = [
  {
    slug: "spark",
    name: "Spark",
    eyebrow: "For curious builders",
    description: "A focused AI workspace for turning small ideas into shipped experiments.",
    features: "Fast model access|Prompt workspace|Community templates|Email support",
    priceCents: 1900,
    billingPeriod: "month",
    accent: "blue",
    featured: 0,
  },
  {
    slug: "studio",
    name: "Studio",
    eyebrow: "For serious makers",
    description: "More runway for teams building repeatable AI workflows and internal tools.",
    features: "Everything in Spark|Higher usage limits|Workflow automations|Priority support",
    priceCents: 4900,
    billingPeriod: "month",
    accent: "violet",
    featured: 1,
  },
  {
    slug: "orbit",
    name: "Orbit",
    eyebrow: "For ambitious teams",
    description: "A collaborative AI operating layer for teams that need speed, context, and control.",
    features: "Everything in Studio|Team workspaces|Advanced integrations|Dedicated follow-up",
    priceCents: 9900,
    billingPeriod: "month",
    accent: "orange",
    featured: 0,
  },
];

/** Lazily creates a Drizzle instance so local tooling can run without a DB. */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function ensureDefaultProducts() {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length === 0) {
    await db.insert(products).values(defaultProducts);
  }
}

export async function getProducts() {
  const db = await getDb();
  if (!db) return defaultProducts.map((product, index) => ({ ...product, id: index + 1 }));
  await ensureDefaultProducts();
  return db.select().from(products).orderBy(products.priceCents);
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return defaultProducts.find(product => product.slug === slug);
  await ensureDefaultProducts();
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function createTicket(ticket: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(tickets).values(ticket);
  const result = await db.select().from(tickets).where(eq(tickets.ticketCode, ticket.ticketCode)).limit(1);
  return result[0];
}

export async function getTickets() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: tickets.id,
      ticketCode: tickets.ticketCode,
      productId: tickets.productId,
      productName: products.name,
      userId: tickets.userId,
      customerName: tickets.customerName,
      customerEmail: tickets.customerEmail,
      customerPhone: tickets.customerPhone,
      company: tickets.company,
      message: tickets.message,
      status: tickets.status,
      followUpNotes: tickets.followUpNotes,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .leftJoin(products, eq(tickets.productId, products.id))
    .orderBy(desc(tickets.createdAt));
}

export async function getTicketsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: tickets.id,
      ticketCode: tickets.ticketCode,
      productName: products.name,
      customerName: tickets.customerName,
      customerEmail: tickets.customerEmail,
      customerPhone: tickets.customerPhone,
      company: tickets.company,
      message: tickets.message,
      status: tickets.status,
      followUpNotes: tickets.followUpNotes,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
    })
    .from(tickets)
    .leftJoin(products, eq(tickets.productId, products.id))
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.createdAt));
}

export async function updateTicket(
  ticketId: number,
  status: "new" | "contacted" | "in_progress" | "completed" | "closed",
  followUpNotes: string | null,
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db
    .update(tickets)
    .set({ status, followUpNotes, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId));
  const result = await getTickets();
  return result.find(ticket => ticket.id === ticketId);
}
