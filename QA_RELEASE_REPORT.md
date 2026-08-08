# QA Release Report — AI-Sana (01hh.vercel.app / github.com/aidanaakylbek/-01-)

**Audit date:** 2026-08-08
**Auditor:** Claude (acting as senior QA engineer / release manager)
**Scope:** Full source review (frontend, server functions, DB layer, API routes) + live testing against a local instance running the exact deployed code, plus targeted read-only verification against the live production site.
**Update 1:** Revised after a second pass that fixed every issue safely fixable from code alone (password hashing, rate limiting, an IDOR found during regression testing, a hydration bug, dead code).
**Update 2 (final):** The site owner set `ADMIN_PASSWORD` and `SESSION_SECRET` in Vercel and redeployed. Re-verified live against production: the old default admin password no longer works, and session forgery with the old fallback secret no longer works either. **CRIT-03 is now closed. All critical and high findings in this report are fixed and confirmed live.**

---

## Executive Summary

This audit found and fixed **four critical/high vulnerabilities in the live production site**, each proven with reproducible, non-destructive live tests (not just code inspection), fixed, and re-verified with regression tests:

1. **Session cookie forgery.** The session cookie was an unsigned plaintext email address. Anyone could set `Cookie: ai_sana_email=<any user's email>` and be authenticated as that user — including the hardcoded admin account — with no password. **Fixed:** cookie is now HMAC-signed and verified.
2. **Payment approval had zero authorization.** `/admin/payments` and the underlying server functions were reachable by anyone via plain HTTP with no cookies at all — full PII of every customer, plus the ability to approve/reject any payment, including a free user approving their own payment for free. **Fixed:** server-side admin-role check added.
3. **Payment-confirmation IDOR (found while regression-testing fix #2).** The customer-facing `/payment` page reused the same unscoped lookup and had a `?? requests[0]` fallback that would silently show a *different* customer's name, phone, and payment amount whenever the URL's `requestId` didn't match. **Fixed:** replaced with an ownership-scoped lookup.
4. **Weak password storage.** Passwords were unsalted SHA-256 (Supabase mode) or **plaintext** (in-memory mode). **Fixed:** scrypt with a random per-password salt, with transparent migration for existing accounts on next login.

Also fixed: no rate limiting on any AI endpoint (a compromised or buggy account could run up unlimited OpenAI/Gemini cost), a hydration-crashing price-formatting bug on `/pricing`, `/diagnostic-result`, `/payment`, and `/admin/payments`, and a dead orphaned `backend/` folder from an earlier version of this project.

**The last critical issue — closed.** The admin account's fallback password (`admin@ai-sana.kz` / `AiSanaAdmin2026!`), hardcoded in the public GitHub repository, was confirmed working via a live login attempt against production. I generated replacement values and the site owner set `ADMIN_PASSWORD`/`SESSION_SECRET` in Vercel and redeployed. Re-verified live: the old default password now fails to log in, and a forged session cookie signed with the old fallback secret is now rejected.

---

## Overall Status

## ⚠️ READY WITH CONDITIONS

Every critical and high finding in this audit is fixed, deployed, and confirmed live on production — including CRIT-03, closed by the owner setting `ADMIN_PASSWORD`/`SESSION_SECRET` in Vercel (re-verified: old default admin password rejected, old-secret cookie forgery rejected).

The one remaining condition before this is an unqualified **READY**: confirm HIGH-02 (Supabase actually configured in Production, so account/payment data survives serverless cold starts) — this is the only thing in the whole audit I structurally cannot check from outside the Vercel dashboard.

---

## Critical Issues

### CRIT-01 — Session cookie forgery = full account takeover (including admin) — ✅ FIXED & VERIFIED
- **Severity:** 🔴 CRITICAL | **Category:** Authentication / Session Management
- **Affected file:** `src/lib/account-store.server.ts`
- **Reproduction (pre-fix):** `curl "http://localhost:8080/plan" -H "Cookie: ai_sana_email=admin@ai-sana.kz"` returned the real admin account's private data with zero credentials.
- **Root cause:** The session cookie stored the plain email with no signature. `httpOnly`/`sameSite`/`secure` stop JavaScript from touching it, but nothing stopped curl, a script, or devtools from setting an arbitrary value the server trusted outright.
- **Fix:** Cookie value is now `email.HMAC-SHA256(email, SESSION_SECRET)`, verified with `crypto.timingSafeEqual`. Forged/unsigned values are rejected.
- **Regression:** Forged cookie → nothing. Correctly-signed non-admin session → still works, still correctly blocked from `/admin/payments`. Legitimate admin login → unaffected.
- **⚠️ Your action:** Set `SESSION_SECRET` in Vercel (see Final Launch Decision for a generated value). Without it, the code falls back to a fixed dev-only string that's also public in this repo. Deploying this invalidates every existing session (expected).

### CRIT-02 — Payment approval and admin payment panel had zero authorization — ✅ FIXED & VERIFIED
- **Severity:** 🔴 CRITICAL | **Category:** Broken Access Control / Payment Fraud
- **Affected files:** `src/lib/account-store.server.ts` (`listPaymentRequests`, `updatePaymentRequest`), `src/routes/admin.payments.tsx`, `src/lib/vocabulary.server.ts` (`getAdminVocabularyTopics` had the same gap)
- **Reproduction (pre-fix):** `curl https://.../admin/payments` with zero cookies returned the full server-rendered page — every pending payment, every customer's email/phone/amount, and working Approve/Reject buttons. A logged-in free student could create their own payment request then call `updatePaymentRequest({ action: "approve" })` directly and activate their own subscription for free.
- **Root cause:** Neither the loader nor the account-store functions ever checked `role === "admin"`. The only gate was a client-side `useEffect` redirect that does nothing against a request that never runs JavaScript.
- **Fix:** Added `requireAdminAccount()` at the top of `listPaymentRequests`, `updatePaymentRequest`, and `getAdminVocabularyTopics`.
- **Regression:** Anonymous curl → `ADMIN_REQUIRED`, no data. Signed-in non-admin → same, blocked. Signed-in real admin → full panel works exactly as before.

### CRIT-04 — Payment-confirmation page leaked other customers' data (found during regression testing) — ✅ FIXED & VERIFIED
- **Severity:** 🔴 CRITICAL | **Category:** IDOR / PII Exposure
- **Affected file:** `src/routes/payment.tsx`
- **How it was found:** While regression-testing the CRIT-02 fix, I checked whether the customer-facing `/payment?requestId=...` confirmation page still worked correctly for a real customer — it called the *same* `listPaymentRequests` I'd just locked to admin-only, so ordinary customers would have been broken by my own fix. Looking closer at the original code turned up something worse than a broken page: `requests.find(r => r.id === search.requestId) ?? requests[0] ?? null` — if the id in the URL didn't match anything (a typo, a stale bookmark, a copy-paste error), it silently fell back to showing the **most recent payment request in the entire system**, regardless of whose it was: another customer's name, phone number, and amount, rendered directly on the page.
- **Fix:** Added `getOwnPaymentRequest(id)`, which requires a valid session and checks the request's `userId` actually matches the caller's account id before returning anything. No fallback to "some other request" — a missing/wrong id now shows a proper "not found" state.
- **Regression:** Verified live — a bogus `requestId` now shows "Төлем өтінімі табылмады" (not found) and does **not** contain the real, existing payment request's id anywhere in the response. Own request still displays correctly.

### CRIT-03 — Default admin password was live on production — ✅ FIXED & VERIFIED (owner action)
- **Severity:** 🔴 CRITICAL | **Category:** Authentication / Exposed Credentials
- **Affected file:** `src/lib/account-store.server.ts` (`ADMIN_EMAIL`/`ADMIN_PASSWORD` fallback)
- **Reproduction (verified live, read-only, single login attempt, no further action taken):** Logged in to `https://01hh.vercel.app/login` with `admin@ai-sana.kz` / `AiSanaAdmin2026!` → landed on `/home` as admin. **This worked on production during this audit.**
- **Root cause:** `process.env.ADMIN_PASSWORD ?? "AiSanaAdmin2026!"` — the fallback is hardcoded in a public repo, and the admin bypass applies unconditionally.
- **Fix:** This wasn't a code bug — it was a missing production secret, so the fix was operational: the site owner set `ADMIN_PASSWORD` and `SESSION_SECRET` to strong generated values in Vercel → Production and redeployed.
- **Regression (verified live, post-redeploy):** The exact same login attempt with the old default credentials now fails and stays on `/login`. A session cookie forged using the old fallback `SESSION_SECRET` is now rejected. Site itself confirmed fully up (`/`, `/login`, `/pricing`, `/register` all `200`).

---

## High Issues

### HIGH-01 — Weak password storage — ✅ FIXED & VERIFIED
- **Severity:** 🟠 HIGH | **Category:** Authentication
- **Affected files:** `src/lib/supabase-db.server.ts`, `src/lib/account-store.server.ts`
- Was: unsalted SHA-256 (Supabase mode) or **plaintext** (in-memory mode, including the hardcoded demo account's password sitting in cleartext in the source).
- **Fix:** `hashPassword` now uses `scrypt` (Node's built-in, salted, deliberately slow KDF) with a random 16-byte salt per password, format `scrypt:<salt>:<hash>`, compared with `timingSafeEqual`. `verifyPassword` understands both the new format and the legacy raw sha256 digest, so **no existing account is locked out** — a successful legacy login transparently rehashes and upgrades that account's stored password in the same request.
- **Regression:** New registration → login round trip works. The hardcoded demo account (`aidana@aibi.kz` / `demo123`, now hashed at startup) still logs in correctly. Real admin login unaffected.

### HIGH-02 — In-memory data store has no persistence guarantee — ⚠️ COULD NOT VERIFY, needs your confirmation
- **Severity:** 🟠 HIGH | **Category:** Production Configuration / Data Loss
- **Affected file:** `src/lib/account-store.server.ts`
- When `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` aren't set, every account, payment, and progress record lives in a JS `Map` in server memory — which is not guaranteed to survive across Vercel serverless invocations. I cannot see your Vercel environment variables from here, so I cannot confirm whether this applies to your production deployment.
- **What to do:** In Vercel → Settings → Environment Variables, confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set for Production, and that `supabase/schema.sql` has actually been run against that project. If either is missing, **do not launch** until it's fixed — every signup is at risk of silently vanishing.

### HIGH-03 — No rate limiting on AI Tutor / paid endpoints — ✅ FIXED & VERIFIED
- **Severity:** 🟠 HIGH | **Category:** Abuse / Cost Control
- **Affected files:** `src/routes/api/ai-tutor/chat.ts`, `chat.ts`, `explain-solution.ts`, `review.ts`, `tts.ts`
- Auth/subscription checks on these endpoints were already correct server-side, but nothing capped how many times one account could call them — each call spends real OpenAI/Gemini budget.
- **Fix:** Added `src/lib/rate-limit.server.ts`, a simple in-memory sliding-window limiter (15-20 requests/minute per account depending on endpoint), applied to all five AI-calling routes.
- **Regression:** Verified live — hammering `/api/ai-tutor/chat` as a real logged-in account returned `200` for requests 1-15 and `429 RATE_LIMITED` starting at request 16, exactly as configured. Note: this is in-memory per server instance, so it's a cost/abuse guard rather than a hard global cap under Vercel's multi-instance serverless model — good enough for launch, worth revisiting if you later add a shared store (e.g. Redis) for a stricter limit.

---

## Medium Issues

### MED-01 — Hydration crash on price-displaying pages — ✅ FIXED & VERIFIED
- **Severity:** 🟡 MEDIUM | **Category:** Correctness / Performance
- **Affected files:** `src/routes/pricing.tsx`, `diagnostic-result.tsx`, `payment.tsx`, `admin.payments.tsx`
- **Was:** `plan.price.toLocaleString("kk-KZ")` rendered `9,990` on the server and `9 990` in the browser (Node's ICU data vs. browser `Intl` disagree on `kk-KZ` grouping), which threw a full React hydration error in the console on every load of `/pricing` — the single most important page for conversion — and forced a client-side re-render of the whole page.
- **Fix:** Added `formatThousands()` in `src/lib/utils.ts` (manual, locale-independent digit grouping) and replaced every `toLocaleString("kk-KZ")` call for money amounts across the four affected pages.
- **Regression:** Production build passes; verified the formatter produces identical output regardless of environment (it doesn't depend on `Intl` at all).

### MED-02 — Paid lesson/diagnostic content ships to every visitor's browser — not fixed (informational)
- **Severity:** 🟡 MEDIUM | **Category:** Content Protection
- **Affected files:** `src/data/subjects.ts`, `src/data/diagnostic-questions.ts`, `src/data/nis-diagnostic-questions.ts`, `src/data/topic-challenge.ts`
- These are plain client-bundled modules (not `.server.ts`), confirmed present in the `diagnostic-*.js` client chunk (~458KB, the largest in the app). Page-level access control is real, but a technically-inclined free user can read every lesson/question/answer from browser devtools regardless of subscription status.
- **Not fixed** — this would require restructuring how lesson content is delivered (moving it behind a server function, like vocabulary content already correctly does), which is a bigger architectural change than appropriate to make unprompted. Flagging for a deliberate decision on your end.

### MED-03 — `/admin/payments` and `/admin/vocabulary` return HTTP 500 on production
- **Severity:** 🟡 MEDIUM | **Category:** Production Configuration
- Both before and after the CRIT-02 fix, `curl https://01hh.vercel.app/admin/payments` returns `500` rather than a clean response. Post-fix this fails *closed* (confirmed no data leaks either way), but the 500 itself suggests something else is misconfigured for this route in production — most likely tied to HIGH-02 (a Supabase query failing). Needs a look at Vercel's function logs, which I don't have access to.

---

## Low Issues

### LOW-01 — Dead, orphaned `backend/` folder — ✅ FIXED
- Deleted. It was a separate Express app (`console.log("✅ AulBridge Backend running...")`) from an earlier, differently-named version of this project, with its own unrelated `package.json`/`Dockerfile`/`docker-compose.yml`/auth scheme. Not referenced anywhere by the deployed site.

### LOW-02 — Deprecated API usage (dev-time warnings only) — not fixed, non-blocking
- `createServerFn().inputValidator(...)` is deprecated in favor of `.validator(...)` across `account.functions.ts` and `vocabulary.functions.ts`. Purely a console warning today; left alone this session to avoid touching every server function signature for a cosmetic, non-blocking issue on top of everything else already changed.

### LOW-03 — Orphaned "Terms of Service" footer string — ✅ FIXED
- `footer_terms` existed in all three language dictionaries but was never rendered anywhere (`/terms` → 404, and the footer component never referenced the key). Removed the dead strings rather than fabricate placeholder legal text, which isn't something to invent without your/legal's review.

### LOW-04 (fixed earlier in this same session, noted for completeness)
- Favicon, `robots.txt`, `sitemap.xml`, `og:image`, `html lang`, all-English page titles, English-only public homepage, duplicate/dead profile-page UI, duplicated progress-page right rail, and the footer copyright year.

---

## Security Findings
Covered above: CRIT-01, CRIT-02, CRIT-03, CRIT-04, HIGH-01, HIGH-03. Additionally verified as **passing**:
- `/api/telegram/webhook` validates a secret token before processing updates.
- `/api/cron/send-weekly-reports` requires `isAuthorizedCronRequest` — not open to the public.
- `/api/ai-tutor/chat` and friends correctly check auth → Telegram verification → subscription server-side before calling paid AI APIs.
- No hardcoded API keys/Supabase key/Telegram token found in the client JS bundle after a production build.
- `.env` gitignored; only `.env.example` committed.
- Cookies: `httpOnly`, `sameSite=lax`, `secure` in production — correct flags (the bug was the unsigned value, now fixed).
- No further IDOR found after CRIT-04 was fixed — payment requests, exam attempts, etc. are all scoped through the authenticated account.

**Not verified in this environment** (a gap, not a pass): SQL/NoSQL injection against a live Supabase project (the PostgREST filter values are `encodeURIComponent`-escaped, which looks safe, but wasn't attack-tested against real infrastructure), CSRF (mitigated by `sameSite=lax` same-origin POSTs by design, not independently pentested), brute-force/lockout on `/login` (no lockout exists — repeated password guessing isn't throttled; not launch-blocking but worth a follow-up), Safari, Firefox, and exhaustive manual mobile/tablet visual QA.

## Payment Findings
- Kaspi Pay is **fully manual** — no API integration, no webhook. A student picks a plan, a `pending` request is created, an admin verifies the Kaspi transaction outside the system and clicks Approve. This is an honest, reasonable MVP pattern (the UI text says so explicitly), and it's fine to launch with, **now that CRIT-02 and CRIT-04 are fixed**.
- No idempotency issue beyond the now-fixed auth gaps: double-approving an already-approved request just extends the subscription clock again from "now" — minor, worth a follow-up ticket, not launch-blocking.

## Authentication Findings
CRIT-01, CRIT-03, HIGH-01. Registration/login field validation (zod schemas) is solid and server-enforced: email format, password length ≥ 6, required parent fields, duplicate email/phone all correctly rejected via real server-side lookups.

## Authorization Findings
CRIT-02, CRIT-04. Route-level UI gates (`isProtectedBeforeLogin`, etc. in `gamified-platform.tsx`) are client-side only, but for every page checked except the now-fixed admin routes, real server-side enforcement backs them up (AI tutor, diagnostic save, exam save, payment ownership all correctly call the authenticated account, not trust the client).

## UX/UI Findings
- Verified live: registration form, direct-URL access to gated pages before Telegram verification correctly bounces to `/verify-parent-telegram`.
- MED-01 (fixed): hydration crash on price pages.
- **Not exhaustively tested:** Safari (unavailable in this environment), Firefox (time didn't allow a full second-browser pass), full manual mobile/tablet/desktop QA across every page × all three languages. Flagging honestly rather than claiming coverage that wasn't done.

## Performance Findings
- Production build succeeds cleanly.
- Largest client chunk: `diagnostic-*.js`, ~458KB uncompressed (see MED-02).
- `@google/genai` correctly stays server-only.
- No Lighthouse/Core Web Vitals pass or concurrent-user load test run this session.

## Production Configuration
- ✅ `.env` gitignored, no secrets in client bundle, production build passes.
- ✅ `robots.txt`, `sitemap.xml`, favicon, `og:image`, page titles all localized (earlier this session).
- ✅ Dead `backend/` folder removed.
- ✅ `SESSION_SECRET`, `ADMIN_PASSWORD` set in Vercel Production and verified live.
- ⚠️ Confirm `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set in Production (HIGH-02) — could not verify from outside the deployment.
- ❓ No explicit CORS headers on API routes — likely fine given same-origin architecture, not independently cross-origin-tested.

## Tested User Flows
- Registration → login round trip with new password hashing — real browser, passed.
- Direct URL access to `/pricing`, `/home` before Telegram verification — correctly blocked.
- Full payment-request-creation flow (`/pricing` → Kaspi button → `/payment`) — works, creates a real record, now correctly scoped to the owner.
- Admin login with default credentials — works on both local and **production** (CRIT-03, still open).
- Anonymous/forged-session access to `/admin/payments` — blocked after fix.
- Non-admin authenticated access to `/admin/payments` — blocked after fix.
- Rate limiter — verified tripping at request 16/15 against a live endpoint.

## Failed Tests (at time of discovery — see status per item above)
- Session cookie forgery. **Fixed.**
- Unauthenticated payment approval / PII listing. **Fixed.**
- Payment-confirmation IDOR (other customer's data on wrong/missing id). **Fixed.**
- Weak/plaintext password storage. **Fixed.**
- Unlimited AI endpoint calls. **Fixed.**
- `/pricing` (and 3 other pages) hydration mismatch. **Fixed.**
- Default admin credentials on production. **Fixed — owner rotated the secret, verified live.**
- `/admin/payments`, `/admin/vocabulary` return HTTP 500 on production (MED-03). **Still open.**

## Passed Tests
- Registration field validation (server-enforced).
- Telegram/diagnostic/pricing gating for a brand-new unverified account.
- AI Tutor endpoint auth + subscription check.
- Telegram webhook secret validation.
- Cron endpoint authorization.
- No secrets in the client JS bundle.
- Full regression suite after all fixes: real admin login, new-account registration+login, demo-account login, payment ownership scoping, rate limiter — all green.

## Recommended Fixes
1. ✅ Done — `ADMIN_PASSWORD` and `SESSION_SECRET` set in Vercel Production and redeployed; verified live.
2. Confirm `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are set in Production and the schema is applied (HIGH-02) — the one remaining open item.
3. Investigate the production 500 on `/admin/payments`/`/admin/vocabulary` via Vercel logs (MED-03) — likely related to #2.
4. Decide whether lesson/diagnostic content sensitivity justifies moving it server-side (MED-02) — not urgent.
5. Add login lockout/throttling if you want defense against password-guessing (not currently blocking).

## Final Launch Decision

## ⚠️ READY WITH CONDITIONS

Every critical and high issue found in this audit — session cookie forgery, zero-authorization payment/admin endpoints, a payment-confirmation IDOR, weak password storage, unlimited AI endpoint calls, the default admin password — is fixed, deployed, and **confirmed live on production** as of this update.

**One condition remains before this is an unqualified READY:** confirm in the Vercel dashboard that `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are actually set for Production and that `supabase/schema.sql` has been applied to that project (HIGH-02). This determines whether account/payment data reliably survives across serverless invocations. I cannot check Vercel's environment variable list from this environment — this is a quick manual confirmation, not more remediation work.

---

## ТОП-5 вещей, которые нужно исправить перед запуском

1. ✅ ~~`ADMIN_PASSWORD` и `SESSION_SECRET` в Vercel~~ — сделано и подтверждено на проде.
2. **Проверь, что Supabase реально настроен в проде** (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`) — единственное, что осталось. Иначе данные пользователей могут пропадать между запросами.
3. ✅ ~~Хэширование паролей~~ — исправлено (scrypt с солью).
4. ✅ ~~Rate limiting на AI-эндпоинты~~ — исправлено.
5. ✅ ~~Hydration-баг на `/pricing`~~ — исправлено.

**После пункта 2 сайт полностью готов к запуску.**

После пункта 1 и 2 сайт готов к запуску.
