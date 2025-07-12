import {
  users,
  items,
  swaps,
  pointTransactions,
  type User,
  type InsertUser,
  type Item,
  type InsertItem,
  type ItemWithOwner,
  type Swap,
  type InsertSwap,
  type SwapWithDetails,
  type PointTransaction,
  type InsertPointTransaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, count, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<void>;

  // Item operations
  getItems(filters?: {
    category?: string;
    size?: string;
    condition?: string;
    search?: string;
    status?: string;
    ownerId?: number;
  }): Promise<ItemWithOwner[]>;
  getItem(id: number): Promise<ItemWithOwner | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItemStatus(id: number, status: string): Promise<void>;
  deleteItem(id: number): Promise<void>;

  // Swap operations
  getSwaps(userId?: number): Promise<SwapWithDetails[]>;
  getSwap(id: number): Promise<SwapWithDetails | undefined>;
  createSwap(swap: InsertSwap): Promise<Swap>;
  updateSwapStatus(id: number, status: string): Promise<void>;

  // Point transaction operations
  getPointTransactions(userId: number): Promise<PointTransaction[]>;
  createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;

  // Admin operations
  getPendingItems(): Promise<ItemWithOwner[]>;
  getUserStats(): Promise<{ totalUsers: number; totalItems: number; totalSwaps: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<void> {
    await db
      .update(users)
      .set({ points })
      .where(eq(users.id, userId));
  }

  // Item operations
  async getItems(filters?: {
    category?: string;
    size?: string;
    condition?: string;
    search?: string;
    status?: string;
    ownerId?: number;
  }): Promise<ItemWithOwner[]> {
    let query = db
      .select()
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(eq(items.status, filters?.status || "approved"));

    if (filters?.category) {
      query = query.where(eq(items.category, filters.category));
    }
    if (filters?.size) {
      query = query.where(eq(items.size, filters.size));
    }
    if (filters?.condition) {
      query = query.where(eq(items.condition, filters.condition));
    }
    if (filters?.search) {
      query = query.where(
        or(
          ilike(items.title, `%${filters.search}%`),
          ilike(items.description, `%${filters.search}%`)
        )
      );
    }
    if (filters?.ownerId) {
      query = query.where(eq(items.ownerId, filters.ownerId));
    }

    const results = await query.orderBy(desc(items.createdAt));
    
    return results.map(result => ({
      ...result.items,
      owner: result.users!,
    }));
  }

  async getItem(id: number): Promise<ItemWithOwner | undefined> {
    const [result] = await db
      .select()
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(eq(items.id, id));

    if (!result) return undefined;

    return {
      ...result.items,
      owner: result.users!,
    };
  }

  async createItem(itemData: InsertItem): Promise<Item> {
    const [item] = await db
      .insert(items)
      .values(itemData)
      .returning();
    return item;
  }

  async updateItemStatus(id: number, status: string): Promise<void> {
    await db
      .update(items)
      .set({ status })
      .where(eq(items.id, id));
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  // Swap operations
  async getSwaps(userId?: number): Promise<SwapWithDetails[]> {
    let query = db
      .select()
      .from(swaps)
      .leftJoin(items, eq(swaps.itemId, items.id))
      .leftJoin(users, eq(items.ownerId, users.id));

    if (userId) {
      query = query.where(
        or(
          eq(swaps.requesterId, userId),
          eq(swaps.ownerId, userId)
        )
      );
    }

    const results = await query.orderBy(desc(swaps.createdAt));
    
    return results.map(result => ({
      ...result.swaps,
      item: {
        ...result.items!,
        owner: result.users!,
      },
      requester: result.users!,
      owner: result.users!,
    }));
  }

  async getSwap(id: number): Promise<SwapWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(swaps)
      .leftJoin(items, eq(swaps.itemId, items.id))
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(eq(swaps.id, id));

    if (!result) return undefined;

    return {
      ...result.swaps,
      item: {
        ...result.items!,
        owner: result.users!,
      },
      requester: result.users!,
      owner: result.users!,
    };
  }

  async createSwap(swapData: InsertSwap): Promise<Swap> {
    const [swap] = await db
      .insert(swaps)
      .values(swapData)
      .returning();
    return swap;
  }

  async updateSwapStatus(id: number, status: string): Promise<void> {
    await db
      .update(swaps)
      .set({ status })
      .where(eq(swaps.id, id));
  }

  // Point transaction operations
  async getPointTransactions(userId: number): Promise<PointTransaction[]> {
    return await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.userId, userId))
      .orderBy(desc(pointTransactions.createdAt));
  }

  async createPointTransaction(transactionData: InsertPointTransaction): Promise<PointTransaction> {
    const [transaction] = await db
      .insert(pointTransactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  // Admin operations
  async getPendingItems(): Promise<ItemWithOwner[]> {
    const results = await db
      .select()
      .from(items)
      .leftJoin(users, eq(items.ownerId, users.id))
      .where(eq(items.status, "pending"))
      .orderBy(desc(items.createdAt));
    
    return results.map(result => ({
      ...result.items,
      owner: result.users!,
    }));
  }

  async getUserStats(): Promise<{ totalUsers: number; totalItems: number; totalSwaps: number }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [itemCount] = await db.select({ count: count() }).from(items);
    const [swapCount] = await db.select({ count: count() }).from(swaps);

    return {
      totalUsers: userCount.count,
      totalItems: itemCount.count,
      totalSwaps: swapCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
