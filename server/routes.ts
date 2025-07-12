import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import {
  requireAuth,
  requireAdmin,
  hashPassword,
  comparePassword,
  type AuthRequest,
} from "./middleware/auth";
import { upload } from "./middleware/upload";
import {
  insertUserSchema,
  insertItemSchema,
  insertSwapSchema,
} from "@shared/schema";
import fs from "fs";
import path from "path";
import {
  generateItemSuggestions,
  parseNaturalSearch,
} from "./gemini";

import { db } from "./db";
import { items, users, requests } from "@shared/schema";
import { eq, sql, and, desc, or } from "drizzle-orm";


const pgSession = connectPg(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads folder exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  
  // ------------------ AUTH ROUTES ------------------ //
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

      (req.session as any).userId = user.id; // Set session
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

      (req.session as any).userId = user.id;
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
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ------------------ ITEM ROUTES ------------------ //
  app.get("/api/items", async (req, res) => {
    try {
      const items = await storage.getItems(req.query as any);
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
      if (!item) return res.status(404).json({ message: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("Get item error:", error);
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post(
    "/api/items",
    requireAuth,
    upload.array("images", 5),
    async (req: AuthRequest, res) => {
      try {
        const files = req.files as Express.Multer.File[];
        const images = files.map((file) => `/uploads/${file.filename}`);

        const validated = insertItemSchema.parse({
          ...req.body,
          ownerId: req.user!.id,
          images,
          tags: req.body.tags
            ? req.body.tags.split(",").map((tag: string) => tag.trim())
            : [],
          points: parseInt(req.body.points) || 25,
        });

        const item = await storage.createItem(validated);
        res.json(item);
      } catch (error) {
        console.error("Create item error:", error);
        res.status(400).json({ message: "Failed to create item" });
      }
    }
  );

  app.get("/api/user/items", requireAuth, async (req: AuthRequest, res) => {
    try {
      const items = await storage.getItems({ ownerId: req.user!.id });
      res.json(items);
    } catch (error) {
      console.error("User items error:", error);
      res.status(500).json({ message: "Failed to fetch user items" });
    }
  });

  // ------------------ AI SUGGESTIONS ------------------ //
  app.post(
    "/api/items/ai-suggestions",
    requireAuth,
    upload.single("image"),
    async (req: AuthRequest, res) => {
      try {
        const { title } = req.body;
        const file = req.file;
        if (!title) {
          return res.status(400).json({ message: "Title is required" });
        }

        const imagePath = file?.path;
        const result = await generateItemSuggestions(title, imagePath);

        // Clean up uploaded image
        if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        res.json(result);
      } catch (error) {
        console.error("AI suggestion error:", error);
        res.status(500).json({ message: "Failed to generate suggestions" });
      }
    }
  );

  // ------------------ ADMIN ROUTES ------------------ //
app.get("/api/admin/items/pending", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const items = await storage.getPendingItems();
    console.log("✅ Pending items fetched:", items); // Debug
    res.json(items);
  } catch (error) {
    console.error("❌ Admin pending items error:", error);
    res.status(500).json({ message: "Failed to fetch pending items" });
  }
});

app.put("/api/admin/items/:id/status", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await storage.updateItemStatus(itemId, status);
    res.json({ message: "Item status updated" });
  } catch (error) {
    console.error("❌ Update item status error:", error);
    res.status(500).json({ message: "Failed to update item status" });
  }
});

app.delete("/api/admin/items/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const itemId = parseInt(req.params.id);
    await storage.deleteItem(itemId);
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("❌ Delete item error:", error);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

app.get("/api/admin/stats", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const stats = await storage.getUserStats();
    res.json(stats);
  } catch (error) {
    console.error("❌ Admin stats error:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

  app.post("/api/requests", requireAuth, async (req: AuthRequest, res) => {
    try {
        const { type, itemId, offeredItemId, offeredPoints } = req.body;
        console.log("Incoming request body:", req.body); // Add this line

        if (!type || !itemId) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const item = await storage.getItem(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        const request = await storage.createRequest({
            type,
            itemId,
            offeredItemId,
            offeredPoints,
            requesterId: req.user!.id,
            ownerId: item.ownerId,
        });

        res.status(201).json(request);
    } catch (err) {
        console.error("Create request error:", err);
        res.status(500).json({ message: "Failed to create request" });
    }
});

app.get("/api/requests/incoming", requireAuth, async (req: AuthRequest, res) => {
  try {
    const requests = await storage.getRequestsForOwner(req.user!.id);
    res.json(requests);
  } catch (err) {
    console.error("Get incoming requests error:", err);
    res.status(500).json({ message: "Failed to get requests" });
  }
});

app.post("/api/requests/:id/approve", requireAuth, async (req: AuthRequest, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const request = await storage.getRequestsForOwner(req.user!.id);
    const found = request.find(r => r.id === requestId);

    if (!found) {
      return res.status(404).json({ message: "Request not found" });
    }

    await storage.approveRequest(requestId);

    // Handle post-approval actions
    if (found.type === "swap") {
      await db.update(items)
        .set({ ownerId: found.requesterId })
        .where(eq(items.id, found.itemId));

      if (found.offeredItemId) {
        await db.update(items)
          .set({ ownerId: found.ownerId })
          .where(eq(items.id, found.offeredItemId));
      }
    } else if (found.type === "points") {
      await db.update(users)
        .set({ points: sql`${users.points} - ${found.offeredPoints}` })
        .where(eq(users.id, found.requesterId));

      await db.update(users)
        .set({ points: sql`${users.points} + ${found.offeredPoints}` })
        .where(eq(users.id, found.ownerId));

      await storage.createPointTransaction({
        userId: found.requesterId,
        amount: -found.offeredPoints!,
        type: "debit",
        description: `Points sent for ${found.itemId}`,
      });

      await storage.createPointTransaction({
        userId: found.ownerId,
        amount: found.offeredPoints!,
        type: "credit",
        description: `Points received for ${found.itemId}`,
      });

      // Optionally delete the item after transfer
      await storage.deleteItem(found.itemId);
    }

    res.json({ message: "Request approved" });
  } catch (err) {
    console.error("Approve request error:", err);
    res.status(500).json({ message: "Failed to approve request" });
  }
});



  // ------------------ SEARCH ------------------ //
  app.post("/api/search/natural", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ message: "Query is required" });

      const filters = await parseNaturalSearch(query);
      const items = await storage.getItems(filters);
      res.json({ filters, items });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // ------------------ UPLOADS STATIC FOLDER ------------------ //
  app.use("/uploads", express.static(uploadsDir));

  return createServer(app);
}


