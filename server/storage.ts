import { User, Product, Rule, RuleProduct, InsertProduct, InsertRule, InsertRuleProduct } from "@shared/schema";

// Simple in-memory storage
const products: Map<number, Product> = new Map();
const rules: Map<number, Rule> = new Map();
const ruleProducts: Map<number, RuleProduct> = new Map();
let nextProductId = 1;
let nextRuleId = 1;
let nextRuleProductId = 1;

export interface IStorage {
  // Product operations
  getUserProducts(userId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number, userId: number): Promise<void>;
  getProduct(id: number, userId: number): Promise<Product | undefined>;
  
  // Rule operations
  getUserRules(userId: number): Promise<Rule[]>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: number, updates: Partial<InsertRule>): Promise<Rule>;
  deleteRule(id: number, userId: number): Promise<void>;
  getRule(id: number, userId: number): Promise<Rule | undefined>;
  
  // Rule-Product operations
  getRuleProducts(ruleId: number): Promise<RuleProduct[]>;
  addProductToRule(ruleProduct: InsertRuleProduct): Promise<RuleProduct>;
  removeProductFromRule(ruleId: number, productId: number): Promise<void>;
}

export class MemoryStorage implements IStorage {
  // Product operations
  async getUserProducts(userId: number): Promise<Product[]> {
    return Array.from(products.values()).filter(p => p.userId === userId);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const product: Product = {
      id: nextProductId++,
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const product = products.get(id);
    if (!product) throw new Error('Product not found');
    
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date(),
    };
    products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: number): Promise<void> {
    const product = products.get(id);
    if (!product || product.userId !== userId) {
      throw new Error('Product not found');
    }
    
    // Remove from any rules
    for (const [rpId, rp] of ruleProducts.entries()) {
      if (rp.productId === id) {
        ruleProducts.delete(rpId);
      }
    }
    
    products.delete(id);
  }

  async getProduct(id: number, userId: number): Promise<Product | undefined> {
    const product = products.get(id);
    return product && product.userId === userId ? product : undefined;
  }

  // Rule operations
  async getUserRules(userId: number): Promise<Rule[]> {
    return Array.from(rules.values()).filter(r => r.userId === userId);
  }

  async createRule(ruleData: InsertRule): Promise<Rule> {
    const rule: Rule = {
      id: nextRuleId++,
      ...ruleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    rules.set(rule.id, rule);
    return rule;
  }

  async updateRule(id: number, updates: Partial<InsertRule>): Promise<Rule> {
    const rule = rules.get(id);
    if (!rule) throw new Error('Rule not found');
    
    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };
    rules.set(id, updatedRule);
    return updatedRule;
  }

  async deleteRule(id: number, userId: number): Promise<void> {
    const rule = rules.get(id);
    if (!rule || rule.userId !== userId) {
      throw new Error('Rule not found');
    }
    
    // Remove all rule-product mappings
    for (const [rpId, rp] of ruleProducts.entries()) {
      if (rp.ruleId === id) {
        ruleProducts.delete(rpId);
      }
    }
    
    rules.delete(id);
  }

  async getRule(id: number, userId: number): Promise<Rule | undefined> {
    const rule = rules.get(id);
    return rule && rule.userId === userId ? rule : undefined;
  }

  // Rule-Product operations
  async getRuleProducts(ruleId: number): Promise<RuleProduct[]> {
    return Array.from(ruleProducts.values()).filter(rp => rp.ruleId === ruleId);
  }

  async addProductToRule(ruleProductData: InsertRuleProduct): Promise<RuleProduct> {
    const ruleProduct: RuleProduct = {
      id: nextRuleProductId++,
      ...ruleProductData,
    };
    ruleProducts.set(ruleProduct.id, ruleProduct);
    return ruleProduct;
  }

  async removeProductFromRule(ruleId: number, productId: number): Promise<void> {
    for (const [rpId, rp] of ruleProducts.entries()) {
      if (rp.ruleId === ruleId && rp.productId === productId) {
        ruleProducts.delete(rpId);
        break;
      }
    }
  }
}

export const storage = new MemoryStorage();