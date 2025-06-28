import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalUrl: text("original_url").notNull(),
  imageUrl: text("image_url"),
  storeDomain: varchar("store_domain").notNull(),
  color: varchar("color"),
  size: varchar("size"),
  availability: varchar("availability"),
  quantity: integer("quantity").default(1).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rules table
export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  trigger: varchar("trigger").notNull(), // price_drop, availability, fast_shipping, specific_date, low_stock
  conditionType: varchar("condition_type"), // price_below, price_drop_percentage, delivery_days, stock_level
  conditionValue: varchar("condition_value"),
  action: varchar("action").notNull(), // notify, highlight, email, mark_urgent
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rule-Product mapping table
export const ruleProducts = pgTable("rule_products", {
  id: serial("id").primaryKey(),
  ruleId: integer("rule_id").notNull().references(() => rules.id),
  productId: integer("product_id").notNull().references(() => products.id),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  rules: many(rules),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  ruleProducts: many(ruleProducts),
}));

export const rulesRelations = relations(rules, ({ one, many }) => ({
  user: one(users, {
    fields: [rules.userId],
    references: [users.id],
  }),
  ruleProducts: many(ruleProducts),
}));

export const ruleProductsRelations = relations(ruleProducts, ({ one }) => ({
  rule: one(rules, {
    fields: [ruleProducts.ruleId],
    references: [rules.id],
  }),
  product: one(products, {
    fields: [ruleProducts.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRuleProductSchema = createInsertSchema(ruleProducts).omit({
  id: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;
export type RuleProduct = typeof ruleProducts.$inferSelect;
export type InsertRuleProduct = z.infer<typeof insertRuleProductSchema>;
