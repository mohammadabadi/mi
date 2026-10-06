ALTER TABLE "group_expenses" ADD COLUMN IF NOT EXISTS "payer_card_number" varchar(19);
ALTER TABLE "group_expenses" ADD COLUMN IF NOT EXISTS "payer_card_note" varchar(160) DEFAULT '' NOT NULL;
