// server/seed.ts
import "dotenv/config";
import { db } from "./db"; // your db.ts file where drizzle is initialized
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  const existingUsers = await db.select().from(users);

  if (existingUsers.length > 0) {
    console.log("❌ Seed data already exists. Aborting.");
    return;
  }

  const passwordHash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  await db.insert(users).values([
    {
      email: "admin@rewear.com",
      password: passwordHash("admin123"),
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      points: 1000,
      profileImageUrl: "https://i.pravatar.cc/150?u=admin",
    },
    {
      email: "user1@rewear.com",
      password: passwordHash("user123"),
      firstName: "John",
      lastName: "Doe",
      role: "user",
      points: 100,
      profileImageUrl: "https://i.pravatar.cc/150?u=user1",
    },
    {
      email: "user2@rewear.com",
      password: passwordHash("user123"),
      firstName: "Jane",
      lastName: "Smith",
      role: "user",
      points: 100,
      profileImageUrl: "https://i.pravatar.cc/150?u=user2",
    },
  ]);

  console.log("✅ Seed data inserted successfully.");
}

seed().catch((err) => {
  console.error("❌ Failed to seed data:", err);
  process.exit(1);
});
