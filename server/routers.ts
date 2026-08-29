import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import {
  createTicket,
  getProductBySlug,
  getProducts,
  getTickets,
  getTicketsByUser,
  updateTicket,
} from "./db";

const ticketStatus = z.enum(["new", "contacted", "in_progress", "completed", "closed"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  products: router({
    list: publicProcedure.query(() => getProducts()),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => getProductBySlug(input.slug)),
  }),
  tickets: router({
    createPurchaseRequest: protectedProcedure
      .input(
        z.object({
          productSlug: z.string().min(1),
          customerName: z.string().trim().min(2).max(160),
          customerEmail: z.string().trim().email().max(320),
          customerPhone: z.string().trim().min(7).max(64),
          company: z.string().trim().max(160).optional(),
          message: z.string().trim().max(2000).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const product = await getProductBySlug(input.productSlug);
        if (!product?.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Subscription product not found" });
        }
        return createTicket({
          ticketCode: `AS-${nanoid(8).toUpperCase()}`,
          productId: product.id,
          userId: ctx.user.id,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          company: input.company || null,
          message: input.message || null,
          status: "new",
          followUpNotes: null,
        });
      }),
    mine: protectedProcedure.query(({ ctx }) => getTicketsByUser(ctx.user.id)),
  }),
  adminTickets: router({
    list: adminProcedure.query(() => getTickets()),
    update: adminProcedure
      .input(
        z.object({
          ticketId: z.number().int().positive(),
          status: ticketStatus,
          followUpNotes: z.string().trim().max(4000).nullable(),
        }),
      )
      .mutation(({ input }) => updateTicket(input.ticketId, input.status, input.followUpNotes)),
  }),
});

export type AppRouter = typeof appRouter;
