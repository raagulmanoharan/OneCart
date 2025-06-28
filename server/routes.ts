import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { ProductExtractor } from "./services/productExtractor";
import { insertProductSchema, insertRuleSchema, insertRuleProductSchema, registerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes are now handled in auth.ts

  // Product extraction endpoint
  app.post('/api/products/extract', isAuthenticated, async (req: any, res) => {
    try {
      const { url } = req.body;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: 'URL is required' });
      }

      const result = await ProductExtractor.extractFromUrl(url);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json(result.product);
    } catch (error) {
      console.error('Product extraction error:', error);
      res.status(500).json({ message: 'Failed to extract product information' });
    }
  });

  // Products CRUD endpoints
  app.get('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const products = await storage.getUserProducts(userId);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productData = { ...req.body, userId };
      
      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData);
      
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      }
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      // Verify product belongs to user
      const existingProduct = await storage.getProduct(productId, userId);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const validatedData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(productId, validatedData);
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid product data', errors: error.errors });
      }
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = parseInt(req.params.id);
      
      if (isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
      }

      await storage.deleteProduct(productId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Failed to delete product' });
    }
  });

  // Rules CRUD endpoints
  app.get('/api/rules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const rules = await storage.getUserRules(userId);
      res.json(rules);
    } catch (error) {
      console.error('Error fetching rules:', error);
      res.status(500).json({ message: 'Failed to fetch rules' });
    }
  });

  app.post('/api/rules', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { productIds, ...ruleData } = req.body;
      
      const ruleDataWithUser = { ...ruleData, userId };
      const validatedRuleData = insertRuleSchema.parse(ruleDataWithUser);
      
      const rule = await storage.createRule(validatedRuleData);
      
      // Add products to rule if provided
      if (productIds && Array.isArray(productIds)) {
        for (const productId of productIds) {
          const ruleProductData = { ruleId: rule.id, productId };
          const validatedRuleProductData = insertRuleProductSchema.parse(ruleProductData);
          await storage.addProductToRule(validatedRuleProductData);
        }
      }
      
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid rule data', errors: error.errors });
      }
      console.error('Error creating rule:', error);
      res.status(500).json({ message: 'Failed to create rule' });
    }
  });

  app.put('/api/rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ruleId = parseInt(req.params.id);
      
      if (isNaN(ruleId)) {
        return res.status(400).json({ message: 'Invalid rule ID' });
      }

      // Verify rule belongs to user
      const existingRule = await storage.getRule(ruleId, userId);
      if (!existingRule) {
        return res.status(404).json({ message: 'Rule not found' });
      }

      const validatedData = insertRuleSchema.partial().parse(req.body);
      const updatedRule = await storage.updateRule(ruleId, validatedData);
      
      res.json(updatedRule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid rule data', errors: error.errors });
      }
      console.error('Error updating rule:', error);
      res.status(500).json({ message: 'Failed to update rule' });
    }
  });

  app.delete('/api/rules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ruleId = parseInt(req.params.id);
      
      if (isNaN(ruleId)) {
        return res.status(400).json({ message: 'Invalid rule ID' });
      }

      await storage.deleteRule(ruleId, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting rule:', error);
      res.status(500).json({ message: 'Failed to delete rule' });
    }
  });

  // Rule-Product management endpoints
  app.get('/api/rules/:id/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ruleId = parseInt(req.params.id);
      
      if (isNaN(ruleId)) {
        return res.status(400).json({ message: 'Invalid rule ID' });
      }

      // Verify rule belongs to user
      const existingRule = await storage.getRule(ruleId, userId);
      if (!existingRule) {
        return res.status(404).json({ message: 'Rule not found' });
      }

      const ruleProducts = await storage.getRuleProducts(ruleId);
      res.json(ruleProducts);
    } catch (error) {
      console.error('Error fetching rule products:', error);
      res.status(500).json({ message: 'Failed to fetch rule products' });
    }
  });

  app.post('/api/rules/:id/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ruleId = parseInt(req.params.id);
      const { productId } = req.body;
      
      if (isNaN(ruleId) || !productId) {
        return res.status(400).json({ message: 'Invalid rule ID or product ID' });
      }

      // Verify rule belongs to user
      const existingRule = await storage.getRule(ruleId, userId);
      if (!existingRule) {
        return res.status(404).json({ message: 'Rule not found' });
      }

      // Verify product belongs to user
      const existingProduct = await storage.getProduct(productId, userId);
      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const ruleProductData = { ruleId, productId };
      const validatedData = insertRuleProductSchema.parse(ruleProductData);
      const ruleProduct = await storage.addProductToRule(validatedData);
      
      res.status(201).json(ruleProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      console.error('Error adding product to rule:', error);
      res.status(500).json({ message: 'Failed to add product to rule' });
    }
  });

  app.delete('/api/rules/:id/products/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const ruleId = parseInt(req.params.id);
      const productId = parseInt(req.params.productId);
      
      if (isNaN(ruleId) || isNaN(productId)) {
        return res.status(400).json({ message: 'Invalid rule ID or product ID' });
      }

      // Verify rule belongs to user
      const existingRule = await storage.getRule(ruleId, userId);
      if (!existingRule) {
        return res.status(404).json({ message: 'Rule not found' });
      }

      await storage.removeProductFromRule(ruleId, productId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing product from rule:', error);
      res.status(500).json({ message: 'Failed to remove product from rule' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
