import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const userRoleEnum = pgEnum("role", ["user", "admin"])

const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }),

  email: varchar("email", { length: 322 }).notNull().unique(),
  isVerfied: boolean("is_verified").default(false),

  password: varchar("password", { length: 100 }),

  role: userRoleEnum().default("user"),

  refreshToken: varchar("refresh_token"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export { usersTable, userRoleEnum };
