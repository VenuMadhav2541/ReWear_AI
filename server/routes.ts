import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { requireAuth, requireAdmin, hashPassword, comparePassword, type AuthRequest } from "./middleware/auth";
import { upload } from "./middleware/upload";
import { insertUserSchema, insertItemSchema, insertSwapSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";

const pgSession = connectPg(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Session configuration
  app.use(session({
    store: new pgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      req.session!.userId = user.id;
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role,
        points: user.points,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session!.userId = user.id;
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role,
        points: user.points,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        role: user.role,
        points: user.points,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Item routes
  app.get("/api/items", async (req, res) => {
    try {
      const { category, size, condition, search } = req.query;
      const items = await storage.getItems({
        category: category as string,
        size: size as string,
        condition: condition as string,
        search: search as string,
      });
      res.json(items);
    } catch (error) {
      console.error("Get items error:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getItem(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Get item error:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/items", requireAuth, upload.array("images", 5), async (req: AuthRequest, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const images = files ? files.map(file => `/uploads/${file.filename}`) : [];
      
      const validatedData = insertItemSchema.parse({
        ...req.body,
        ownerId: req.user!.id,
        images,
        tags: req.body.tags ? req.body.tags.split(",").map((tag: string) => tag.trim()) : [],
        points: parseInt(req.body.points) || 25,
      });

      const item = await storage.createItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Create item error:", error);
      res.status(400).json({ message: "Failed to create item" });
    }
  });

  app.get("/api/user/items", requireAuth, async (req: AuthRequest, res) => {
    try {
      const items = await storage.getItems({ ownerId: req.user!.id, status: undefined });
      res.json(items);
    } catch (error) {
      console.error("Get user items error:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  // Swap routes
  app.get("/api/swaps", requireAuth, async (req: AuthRequest, res) => {
    try {
      const swaps = await storage.getSwaps(req.user!.id);
      res.json(swaps);
    } catch (error) {
      console.error("Get swaps error:", error);
      res.status(500).json({ message: "Failed to fetch swaps" });
    }
  });

  app.post("/api/swaps", requireAuth, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertSwapSchema.parse({
        ...req.body,
        requesterId: req.user!.id,
      });

      const item = await storage.getItem(validatedData.itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (validatedData.swapType === "points") {
        const user = await storage.getUser(req.user!.id);
        if (!user || user.points < validatedData.pointsUsed!) {
          return res.status(400).json({ message: "Insufficient points" });
        }
      }

      const swap = await storage.createSwap({
        ...validatedData,
        ownerId: item.ownerId,
      });

      res.json(swap);
    } catch (error) {
      console.error("Create swap error:", error);
      res.status(400).json({ message: "Failed to create swap" });
    }
  });

  app.put("/api/swaps/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const swap = await storage.getSwap(id);
      if (!swap) {
        return res.status(404).json({ message: "Swap not found" });
      }

      if (swap.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.updateSwapStatus(id, status);

      if (status === "accepted" && swap.swapType === "points") {
        // Deduct points from requester
        const requester = await storage.getUser(swap.requesterId);
        if (requester) {
          await storage.updateUserPoints(swap.requesterId, requester.points - swap.pointsUsed!);
          await storage.createPointTransaction({
            userId: swap.requesterId,
            amount: -swap.pointsUsed!,
            type: "spent",
            description: `Redeemed ${swap.item.title}`,
            relatedSwapId: swap.id,
          });
        }

        // Add points to owner
        const owner = await storage.getUser(swap.ownerId);
        if (owner) {
          await storage.updateUserPoints(swap.ownerId, owner.points + swap.pointsUsed!);
          await storage.createPointTransaction({
            userId: swap.ownerId,
            amount: swap.pointsUsed!,
            type: "earned",
            description: `Earned from ${swap.item.title}`,
            relatedSwapId: swap.id,
          });
        }

        // Mark item as swapped
        await storage.updateItemStatus(swap.itemId, "swapped");
      }

      res.json({ message: "Swap updated successfully" });
    } catch (error) {
      console.error("Update swap error:", error);
      res.status(500).json({ message: "Failed to update swap" });
    }
  });

  // Point transaction routes
  app.get("/api/points/transactions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const transactions = await storage.getPointTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      console.error("Get point transactions error:", error);
      res.status(500).json({ message: "Failed to fetch point transactions" });
    }
  });

  // Admin routes
  app.get("/api/admin/items/pending", requireAuth, requireAdmin, async (req, res) => {
    try {
      const items = await storage.getPendingItems();
      res.json(items);
    } catch (error) {
      console.error("Get pending items error:", error);
      res.status(500).json({ message: "Failed to fetch pending items" });
    }
  });

  app.put("/api/admin/items/:id/status", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      await storage.updateItemStatus(id, status);
      res.json({ message: "Item status updated successfully" });
    } catch (error) {
      console.error("Update item status error:", error);
      res.status(500).json({ message: "Failed to update item status" });
    }
  });

  app.delete("/api/admin/items/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteItem(id);
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Delete item error:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static(uploadsDir));

  const httpServer = createServer(app);
  return httpServer;
}
