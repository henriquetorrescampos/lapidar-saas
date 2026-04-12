-- Update existing users with empty or null role to 'user'
UPDATE "User" SET "role" = 'user' WHERE "role" IS NULL OR "role" = '';