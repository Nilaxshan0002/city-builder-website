CREATE TABLE "cities" (
	"id" text PRIMARY KEY,
	"state" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
