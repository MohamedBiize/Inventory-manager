import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  foreignKey,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Stores user information from Manus OAuth.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["viewer", "manager", "admin"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for organizing products.
 * Stores product categories with descriptions.
 */
export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    nameIdx: uniqueIndex("categories_name_unique").on(table.name),
  })
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products table for inventory management.
 * Stores product information including SKU, price, quantity, and category.
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    sku: varchar("sku", { length: 100 }).notNull(),
    description: text("description"),
    categoryId: int("categoryId").notNull(),
    quantity: int("quantity").default(0).notNull(),
    unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
    minStockLevel: int("minStockLevel").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    categoryFk: foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
    }).onDelete("restrict"),
    skuIdx: uniqueIndex("products_sku_unique").on(table.sku),
    categoryIdx: index("products_categoryId_idx").on(table.categoryId),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Suppliers table for vendor management.
 * Stores supplier information including contact details.
 */
export const suppliers = mysqlTable(
  "suppliers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    nameIdx: uniqueIndex("suppliers_name_unique").on(table.name),
  })
);

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

/**
 * Product-Supplier junction table for many-to-many relationship.
 * Links products to suppliers and stores supplier-specific pricing.
 */
export const productSuppliers = mysqlTable(
  "product_suppliers",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    supplierId: int("supplierId").notNull(),
    supplierSku: varchar("supplierSku", { length: 100 }),
    supplierPrice: decimal("supplierPrice", { precision: 10, scale: 2 }).notNull(),
    leadTimeDays: int("leadTimeDays").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    supplierFk: foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
    }).onDelete("cascade"),
    productSupplierIdx: uniqueIndex("product_suppliers_unique").on(
      table.productId,
      table.supplierId
    ),
    productIdx: index("product_suppliers_productId_idx").on(table.productId),
    supplierIdx: index("product_suppliers_supplierId_idx").on(table.supplierId),
  })
);

export type ProductSupplier = typeof productSuppliers.$inferSelect;
export type InsertProductSupplier = typeof productSuppliers.$inferInsert;

/**
 * Stock movements table for tracking inventory changes.
 * Records all stock additions, removals, and adjustments with reasons.
 */
export const stockMovements = mysqlTable(
  "stock_movements",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    movementType: mysqlEnum("movementType", [
      "purchase",
      "sale",
      "adjustment",
      "return",
      "damage",
    ]).notNull(),
    quantity: int("quantity").notNull(),
    reason: text("reason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("cascade"),
    productIdx: index("stock_movements_productId_idx").on(table.productId),
    createdAtIdx: index("stock_movements_createdAt_idx").on(table.createdAt),
  })
);

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

/**
 * User permissions table for granular access control.
 * Stores role-based permissions for different features.
 */
export const userPermissions = mysqlTable(
  "user_permissions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    permission: varchar("permission", { length: 100 }).notNull(),
    resourceType: varchar("resourceType", { length: 50 }),
    resourceId: int("resourceId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    userPermissionIdx: uniqueIndex("user_permissions_unique").on(
      table.userId,
      table.permission,
      table.resourceType,
      table.resourceId
    ),
    userIdx: index("user_permissions_userId_idx").on(table.userId),
  })
);

export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = typeof userPermissions.$inferInsert;

/**
 * Notifications table for real-time alerts.
 * Stores notifications for users about stock changes and critical events.
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", [
      "stock_low",
      "stock_critical",
      "stock_out",
      "supplier_alert",
      "system",
    ]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    productId: int("productId"),
    supplierId: int("supplierId"),
    read: mysqlEnum("read", ["true", "false"]).default("false").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    productFk: foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
    }).onDelete("set null"),
    supplierFk: foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
    }).onDelete("set null"),
    userIdx: index("notifications_userId_idx").on(table.userId),
    userReadIdx: index("notifications_userId_read_idx").on(table.userId, table.read),
    createdAtIdx: index("notifications_createdAt_idx").on(table.createdAt),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Import history table for tracking CSV imports.
 * Records all data imports with status and error details.
 */
export const importHistory = mysqlTable(
  "import_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    importType: mysqlEnum("importType", ["products", "suppliers"]).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    totalRows: int("totalRows").notNull(),
    successRows: int("successRows").notNull(),
    failedRows: int("failedRows").notNull(),
    status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).notNull(),
    errorDetails: text("errorDetails"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userFk: foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
    }).onDelete("cascade"),
    userIdx: index("import_history_userId_idx").on(table.userId),
    createdAtIdx: index("import_history_createdAt_idx").on(table.createdAt),
  })
);

export type ImportHistory = typeof importHistory.$inferSelect;
export type InsertImportHistory = typeof importHistory.$inferInsert;
