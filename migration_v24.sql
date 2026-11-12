ALTER TABLE request_items ADD COLUMN domestic_shipping INTEGER NOT NULL DEFAULT 0;
ALTER TABLE request_items ADD COLUMN international_shipping INTEGER NOT NULL DEFAULT 0;
ALTER TABLE request_items ADD COLUMN service_fee INTEGER NOT NULL DEFAULT 0;
