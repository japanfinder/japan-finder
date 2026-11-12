# JAPAN FINDER v22 — Staff purchase decision

Keeps the original v14-based website styling, adds a customer cart and an **actual server-backed staff decision workflow**.

## Deployment — Cloudflare Pages (Git integration)

1. Upload **all project files and the `functions/` folder** to the root of your GitHub repository. Uploading only `index.html` is insufficient.
2. Cloudflare Dashboard → Workers & Pages → D1 → Create database `japan-finder-orders`.
3. Open the database console and run the SQL in `schema.sql` to create both tables.
4. Pages project → Settings → Bindings → Add D1 database binding named **DB** pointing to that database.
5. Pages project → Settings → Variables and Secrets → Add encrypted secret named **ADMIN_KEY** with a long random value (at least 32 random characters). Do not put the secret in HTML, GitHub or public variables.
6. Redeploy the Pages project after bindings and secrets are configured. Use a Git-connected Pages project that supports Pages Functions.
7. Staff opens `/admin.html`, enters the secret, and reviews requests. Customers use `/` and click Refresh review status.

**Security / limitations:** Staff key is sent only to same-origin Pages Functions over HTTPS and is kept in JavaScript memory, not localStorage. Protect staff devices. Admin page URL is public but API operations require the secret. For a production business, use Cloudflare Access / real user accounts, rate limits, audit logging, abuse prevention, privacy policy, and secure user authentication. Customer request tokens are stored in their browser: clearing storage loses access. Tokens are bearer credentials; do not share them. This is a prototype, not a payment processor. No stock or prices are automatically fetched. Purchase approval is an operator decision, not a guarantee the listing will still be available.
