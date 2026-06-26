DO $$
BEGIN
    CREATE TYPE "BillingInterval" AS ENUM ('month', 'year');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
