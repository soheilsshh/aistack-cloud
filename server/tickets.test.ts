import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "user" | "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: role === "admin" ? 1 : 2,
    openId: `${role}-test-user`,
    email: `${role}@example.com`,
    name: role === "admin" ? "Admin User" : "Customer User",
    loginMethod: "test",
    role,
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

describe("ticket access control", () => {
  it("rejects ticket listing for non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.adminTickets.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects ticket updates for non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.adminTickets.update({ ticketId: 1, status: "contacted", followUpNotes: "" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates the customer phone before creating a purchase request", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.tickets.createPurchaseRequest({
      productSlug: "studio",
      customerName: "Customer User",
      customerEmail: "customer@example.com",
      customerPhone: "123",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
