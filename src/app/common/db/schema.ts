import {
  boolean,
  pgEnum,
  pgTable,
  text,
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
  isVerified: boolean("is_verified").default(false),

  password: varchar("password", { length: 100 }),
  avatarUrl: text("avatar_url"),

  role: userRoleEnum("role").default("user"),
  isDeleted: boolean().default(false),

  refreshToken: varchar("refresh_token"),
  verificationToken: varchar("verification_token"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export { usersTable, userRoleEnum };
