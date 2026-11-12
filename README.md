# JAPAN FINDER v24 — Staff quotation breakdown

Preserves the original site styling. Staff can enter product price, Japan domestic shipping, international shipping and service fee, and customers can see the itemized total after approval. These are **manual quotes**, not automatic live shipping rates or payment.

## IMPORTANT: Upgrade existing D1 before deploying v24

Cloudflare D1 `japan-finder-orders` → Console: execute the three statements in `migration_v24.sql` **one at a time**. Only run each statement once. Existing `requests` and `request_items` tables and data remain.

Then upload the project files into the GitHub repository, keeping `functions/api/...` paths intact (do not upload ZIP directly). Confirm Cloudflare Pages deployment succeeds.

The admin key should be stored as an encrypted **Secret** in Cloudflare settings, not in public code or screenshots. Rotate any previously exposed key.

Shipping prices must be researched by staff based on destination country, parcel weight, dimensions, and carrier; customs duties and taxes may be extra. A quote is not a confirmed payment or guaranteed stock reservation.
