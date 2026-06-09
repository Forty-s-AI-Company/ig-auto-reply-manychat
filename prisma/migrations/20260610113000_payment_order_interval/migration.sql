ALTER TABLE "PaymentOrder"
ADD COLUMN "interval" "BillingInterval" NOT NULL DEFAULT 'month';
