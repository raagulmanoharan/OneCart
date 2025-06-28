import {
  users,
  products,
  rules,
  ruleProducts,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Rule,
  type InsertRule,
  type RuleProduct,
  type InsertRuleProduct,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getUserProducts(userId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number, userId: string): Promise<void>;
  getProduct(id: number, userId: string): Promise<Product | undefined>;
  
  // Rule operations
  getUserRules(userId: string): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: number, updates: Partial<InsertRule>): Promise<Rule>;
  deleteRule(id: number, userId: string): Promise<void>;
  getRule(id: number, userId: string): Promise<Rule | undefined>;
  
  // Rule-Product operations
  getRuleProducts(ruleId: number): Promise<RuleProduct[]>;
  addProductToRule(ruleProduct: InsertRuleProduct): Promise<RuleProduct>;
  removeProductFromRule(ruleId: number, productId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getUserProducts(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.userId, userId))
      .orderBy(products.createdAt);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: string): Promise<void> {
    await db
      .delete(products)
      .where(and(eq(products.id, id), eq(products.userId, userId)));
  }

  async getProduct(id: number, userId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.userId, userId)));
    return product;
  }

  // Rule operations
  async getUserRules(userId: string): Promise<Rule[]> {
    return await db
      .select()
      .from(rules)
      .where(eq(rules.userId, userId))
      .orderBy(rules.createdAt);
  }

  async createRule(rule: InsertRule): Promise<Rule> {
    const [newRule] = await db
      .insert(rules)
      .values(rule)
      .returning();
    return newRule;
  }

  async updateRule(id: number, updates: Partial<InsertRule>): Promise<Rule> {
    const [updatedRule] = await db
      .update(rules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rules.id, id))
      .returning();
    return updatedRule;
  }

  async deleteRule(id: number, userId: string): Promise<void> {
    // First delete all rule-product mappings
    await db
      .delete(ruleProducts)
      .where(eq(ruleProducts.ruleId, id));
    
    // Then delete the rule
    await db
      .delete(rules)
      .where(and(eq(rules.id, id), eq(rules.userId, userId)));
  }

  async getRule(id: number, userId: string): Promise<Rule | undefined> {
    const [rule] = await db
      .select()
      .from(rules)
      .where(and(eq(rules.id, id), eq(rules.userId, userId)));
    return rule;
  }

  // Rule-Product operations
  async getRuleProducts(ruleId: number): Promise<RuleProduct[]> {
    return await db
      .select()
      .from(ruleProducts)
      .where(eq(ruleProducts.ruleId, ruleId));
  }

  async addProductToRule(ruleProduct: InsertRuleProduct): Promise<RuleProduct> {
    const [newRuleProduct] = await db
      .insert(ruleProducts)
      .values(ruleProduct)
      .returning();
    return newRuleProduct;
  }

  async removeProductFromRule(ruleId: number, productId: number): Promise<void> {
    await db
      .delete(ruleProducts)
      .where(
        and(
          eq(ruleProducts.ruleId, ruleId),
          eq(ruleProducts.productId, productId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
