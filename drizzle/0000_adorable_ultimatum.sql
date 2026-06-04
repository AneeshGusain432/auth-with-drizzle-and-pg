CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50),
	"email" varchar(322) NOT NULL,
	"is_verified" boolean DEFAULT false,
	"password" varchar(100),
	"role" "role" DEFAULT 'user',
	"isDeleted" boolean DEFAULT false,
	"refresh_token" varchar,
	"verification_token" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
