import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { categoryRouter } from "./routers/categoryRouter";
import { productRouter } from "./routers/productRouter";
import { supplierRouter } from "./routers/supplierRouter";
import { stockMovementRouter } from "./routers/stockMovementRouter";
import { permissionRouter } from "./routers/permissionRouter";
import { notificationRouter } from "./routers/notificationRouter";
import { importExportRouter } from "./routers/importExportRouter";

export const appRouter = router({
  // Core system and auth routers
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Inventory management routers
  categories: categoryRouter,
  products: productRouter,
  suppliers: supplierRouter,
  stockMovements: stockMovementRouter,

  // Advanced features routers
  permissions: permissionRouter,
  notifications: notificationRouter,
  importExport: importExportRouter,
});

export type AppRouter = typeof appRouter;
