import { pgTable, text, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userData = pgTable("user_data", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
