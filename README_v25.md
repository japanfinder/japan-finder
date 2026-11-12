# JAPAN FINDER v25 — email 6-digit code login

## Install
1. Cloudflare D1 > `japan-finder-orders` > Console: run each statement in `migration_v25.sql` (once).
2. Cloudflare Pages > japan-finder > Settings > Variables and secrets > Production:
   - `AUTH_SECRET` — **Secret**: long random value (at least 32 random bytes). Do not publish it or screenshot it.
   - `RESEND_API_KEY` — **Secret**: email provider API key.
   - `AUTH_FROM_EMAIL` — **Text**: verified sender, e.g. `JAPAN FINDER <login@yourdomain.example>` (replace with a real verified domain).
   - Existing D1 binding `DB` stays unchanged. Existing `ADMIN_KEY` stays a secret and must not be published.
3. In Resend verify a domain and enable sending; free-tier limits/eligibility may change.
4. Upload all files/folders to GitHub at repository root, preserving the exact `functions/api/...` paths. Do NOT upload the ZIP itself.
5. Wait for Cloudflare Pages successful production deployment. Test sending and entering a real code. Never share a verification code.

## Behavior and limitations
- Existing white/green design and product/search/admin flows remain.
- Six-digit code expires after 10 minutes, max 5 guesses per code; sending and verification are rate limited.
- Secure HttpOnly session cookie lasts up to 30 days. Logging out revokes that session.
- Draft cart items synchronize to D1 for signed-in users. On first sign-in, local drafts merge into the cloud cart. Cart supports up to 100 draft items per user.
- Existing staff-review requests and their cancellation tokens remain in the original browser's local storage. They are NOT cross-device synchronized or linked to accounts in v25. Staff-approved prices/status are not editable via the account cart endpoint.
- Logging out removes cloud-only draft items from the current browser view, but submitted review items remain in local storage. Logging back in loads cloud drafts.
- No payment or automatic stock check is implemented.
- If the D1 migration or email secrets are missing, login will fail with a configuration message. This is not a frontend-only demo.
- IMPORTANT: Do not use a previously exposed admin key; rotate it in Cloudflare and set it as a Secret.
