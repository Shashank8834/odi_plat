-- Pre-existing schema drift: Invoice.updatedAt was added to schema.prisma
-- but never synced to local dev.db. Backfill before running db push.
ALTER TABLE Invoice ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT '1970-01-01 00:00:00';
UPDATE Invoice SET updatedAt = createdAt;
