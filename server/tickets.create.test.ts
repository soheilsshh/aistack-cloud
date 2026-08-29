import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createTicket: vi.fn(),
  getProductBySlug: vi.fn(),
  getProducts: vi.fn(),
  getTickets: vi.fn(),
  getTicketsByUser: vi.fn(),
  updateTicket: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 17,
    openId: "customer-success-test",
    email: "customer@example.com",
    name: "Customer Success",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("tickets.createPurchaseRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new ticket with the selected product and authenticated user", async () => {
    vi.mocked(db.getProductBySlug).mockResolvedValue({
      id: 42,
      slug: "studio",
      name: "Studio",
      eyebrow: "For serious makers",
      description: "Build repeatable AI workflows.",
      features: "Workflow automations",
      priceCents: 4900,
      billingPeriod: "month",
      accent: "violet",
      featured: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(db.createTicket).mockResolvedValue({
      id: 101,
      ticketCode: "AS-TEST1234",
      productId: 42,
      userId: 17,
      customerName: "Customer Success",
      customerEmail: "customer@example.com",
      customerPhone: "+1 555 010 0101",
      company: "Acme Studio",
      message: "We need a shared AI workspace.",
      status: "new",
      followUpNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.tickets.createPurchaseRequest({
      productSlug: "studio",
      customerName: "Customer Success",
      customerEmail: "customer@example.com",
      customerPhone: "+1 555 010 0101",
      company: "Acme Studio",
      message: "We need a shared AI workspace.",
    });

    expect(result?.ticketCode).toMatch(/^AS-[A-Z0-9]{8}$/);
    expect(db.createTicket).toHaveBeenCalledWith(expect.objectContaining({
      ticketCode: expect.stringMatching(/^AS-[A-Z0-9]{8}$/),
      productId: 42,
      userId: 17,
      customerEmail: "customer@example.com",
      status: "new",
    }));
  });
});
