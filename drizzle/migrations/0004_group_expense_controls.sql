ALTER TYPE "public"."notification_type" ADD VALUE IF NOT EXISTS 'card_shared';

ALTER TABLE "group_expenses" ADD COLUMN IF NOT EXISTS "creator_id" uuid;

UPDATE "group_expenses"
SET "creator_id" = "payer_id"
WHERE "creator_id" IS NULL;

ALTER TABLE "group_expenses"
  ALTER COLUMN "creator_id" SET NOT NULL;

DO $$ BEGIN
 ALTER TABLE "group_expenses" ADD CONSTRAINT "group_expenses_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "group_expenses_creator_id_idx" ON "group_expenses" USING btree ("creator_id");
