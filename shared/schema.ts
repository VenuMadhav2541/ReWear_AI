import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  role: varchar("role").notNull().default("user"), // user, admin
  points: integer("points").notNull().default(100),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // men, women, kids
  type: varchar("type").notNull(), // shirt, pants, dress, jacket, shoes, accessories
  size: varchar("size").notNull(),
  condition: varchar("condition").notNull(), // like-new, excellent, good, fair
  tags: text("tags").array(),
  images: text("images").array(),
  points: integer("points").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected, swapped
  ownerId: integer("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const swaps = pgTable("swaps", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull().references(() => items.id),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, completed
  swapType: varchar("swap_type").notNull(), // direct, points
  pointsUsed: integer("points_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // positive for earning, negative for spending
  type: varchar("type").notNull(), // earned, spent, bonus
  description: varchar("description").notNull(),
  relatedSwapId: integer("related_swap_id").references(() => swaps.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  items: many(items),
  swapsRequested: many(swaps, { relationName: "requester" }),
  swapsOwned: many(swaps, { relationName: "owner" }),
  pointTransactions: many(pointTransactions),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  owner: one(users, {
    fields: [items.ownerId],
    references: [users.id],
  }),
  swaps: many(swaps),
}));

export const swapsRelations = relations(swaps, ({ one }) => ({
  item: one(items, {
    fields: [swaps.itemId],
    references: [items.id],
  }),
  requester: one(users, {
    fields: [swaps.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  owner: one(users, {
    fields: [swaps.ownerId],
    references: [users.id],
    relationName: "owner",
  }),
}));

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  user: one(users, {
    fields: [pointTransactions.userId],
    references: [users.id],
  }),
  relatedSwap: one(swaps, {
    fields: [pointTransactions.relatedSwapId],
    references: [swaps.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSwapSchema = createInsertSchema(swaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Swap = typeof swaps.$inferSelect;
export type InsertSwap = z.infer<typeof insertSwapSchema>;
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

// Extended types with relations
export type ItemWithOwner = Item & {
  owner: User;
};

export type SwapWithDetails = Swap & {
  item: ItemWithOwner;
  requester: User;
  owner: User;
};

export type UserWithStats = User & {
  itemCount: number;
  swapCount: number;
};
