# QA Release Report — AI-Sana (01hh.vercel.app / github.com/aidanaakylbek/-01-)

**Audit date:** 2026-08-08
**Auditor:** Claude (acting as senior QA engineer / release manager)
**Scope:** Full source review (frontend, server functions, DB layer, API routes) + live testing against a local instance running the exact deployed code, plus targeted read-only verification against the live production site.

---

## Executive Summary

This audit found **two critical, actively-exploitable vulnerabilities in the live production site**, both proven with reproducible, non-destructive live tests (not just code inspection):

1. The session cookie was an **unsigned plaintext email address**. Anyone could set `Cookie: ai_sana_email=<any user's email>` and be authenticated as that user — including the hardcoded admin account — with **no password**.
2. The `/admin/payments` panel and its underlying `listPaymentRequests` / `updatePaymentRequest` server functions had **no authorization check at all**. Any anonymous HTTP request (verified with plain `curl`, no browser, no cookies) received the full list of every customer's payment PII and could approve or reject any payment — including **approving your own pending payment for free**, bypassing the subscription paywall entirely.

Both of these were fixed during this audit (signed session cookie + server-side admin-role checks) and **re-verified with regression tests after the fix**. The fixes are pushed to `main` and live on production.

A **third critical issue could not be fixed by me and is still live right now**: the admin account's fallback password (`admin@ai-sana.kz` / `AiSanaAdmin2026!`), hardcoded in the **public** GitHub repository, was confirmed working via a live login attempt against **production** as part of this audit. This means the site is currently open to full admin takeover by anyone who reads the public source. **This requires the site owner to set `ADMIN_PASSWORD` and `SESSION_SECRET` in Vercel's environment variables — I do not have access to do this.**

Payment processing itself is **fully manual** (an admin reviews a Kaspi Pay transaction outside the system and clicks "Approve" — there is no Kaspi API integration, no webhook, no automatic verification). This is a legitimate MVP pattern for a small Kazakhstani business, but combined with finding #2 above it was, until this fix, trivially bypassable by any user.

---

## Overall Status

## 🛑 NOT READY FOR LAUNCH

Not because the code is broken in general — most of the product works as designed, and the two worst bugs found are now fixed and verified. It's **NOT READY** for one specific, decisive reason: **the default admin password is confirmed live on production right now**, publicly readable in the GitHub repo, and I cannot rotate it myself. Launching with that open is not a risk worth taking for a single environment-variable change.

Once the owner sets `ADMIN_PASSWORD` and `SESSION_SECRET` in Vercel (5-minute task, see Recommended Fixes), the picture changes to **READY WITH CONDITIONS** — see the Medium/Low items that should still be addressed soon after.

---

## Critical Issues

### CRIT-01 — Session cookie forgery = full account takeover (including admin) — **FIXED & VERIFIED**
- **Severity:** 🔴 CRITICAL | **Category:** Authentication / Session Management
- **Affected file:** `src/lib/account-store.server.ts` (`getSessionEmail`/`setSessionEmail`)
- **Affected users:** Every user on the platform, including admin
- **Reproduction (pre-fix):**
  1. `curl "http://localhost:8080/plan" -H "Cookie: ai_sana_email=admin@ai-sana.kz"`
  2. Response includes the real admin account's private AI recommendation text (`"Админ аккаунты толық қол жеткізе алады."`), proving full session takeover with zero credentials.
- **Root cause:** The session cookie stored `normalizeEmail(email)` directly with no signature or token. `httpOnly`/`sameSite`/`secure` flags stop *JavaScript* from reading/writing it, but nothing stops a script, curl request, or browser devtools edit from setting an arbitrary cookie value that the server then trusts outright.
- **Fix applied:** Cookie value is now `email.HMAC-SHA256(email, SESSION_SECRET)`, verified with `crypto.timingSafeEqual` on every read. Unsigned/tampered/forged values are now rejected and treated as logged out.
- **Regression test (post-fix):** Same forged-cookie request now returns nothing (no admin data). A cookie signed with the correct secret for a real, non-admin account (Aidana demo account) still authenticates correctly and is still correctly blocked from `/admin/payments` — proving the fix doesn't break legitimate sessions.
- **⚠️ Action required from you:** Set `SESSION_SECRET` to a long random value in Vercel's environment variables. Without it, the code falls back to a fixed dev-only string that is also sitting in the public repo — same vulnerability, different key. Every existing logged-in user's session will be invalidated once this deploys (expected — old cookies are unsigned).

### CRIT-02 — Payment approval and admin payment panel had zero authorization — **FIXED & VERIFIED**
- **Severity:** 🔴 CRITICAL | **Category:** Broken Access Control / Payment Fraud
- **Affected files:** `src/lib/account-store.server.ts` (`listPaymentRequests`, `updatePaymentRequest`), `src/routes/admin.payments.tsx`
- **Affected users:** Every paying customer (PII exposure), the business (revenue bypass)
- **Reproduction (pre-fix):**
  1. `curl https://.../admin/payments` with **zero cookies** returned the full server-rendered page: all pending payment requests, student emails, parent phone numbers, amounts, and working "Approve payment" / "Reject" buttons — before any client-side redirect had a chance to run.
  2. A logged-in **non-admin, free student account** created their own `pending` payment request via the normal `/pricing` flow, then called `updatePaymentRequest({ id: theirRequestId, action: "approve" })` — the same function the admin UI calls — with no admin role and no ownership check. This activated their subscription for free.
- **Root cause:** Neither the route loader nor the underlying account-store functions ever checked `account.role === "admin"`. The only thing standing between an anonymous visitor and this data was a **client-side** `useEffect` redirect (`useAccessGate` in `gamified-platform.tsx`), which does nothing against a request that never runs the page's JavaScript (curl, a script, a bot, or simply reading the network response before the redirect fires).
- **Fix applied:** Added `requireAdminAccount()` (checks `getActiveStoredAccount().role === "admin"`) at the top of `listPaymentRequests` and `updatePaymentRequest`. Also closed the matching gap in `getAdminVocabularyTopics` (read-only vocabulary admin listing had the same hole, though lower stakes).
- **Regression test (post-fix):**
  - Anonymous curl → `ADMIN_REQUIRED` error, no data. ✅
  - Signed-in-but-non-admin curl (Aidana) → `ADMIN_REQUIRED`, no data. ✅
  - Signed-in real admin → full panel works exactly as before. ✅ (no functionality lost)

### CRIT-03 — Default admin password is live on production right now — **NOT FIXED, requires your action**
- **Severity:** 🔴 CRITICAL | **Category:** Authentication / Exposed Credentials
- **Affected file:** `src/lib/account-store.server.ts` lines ~294-295 (`ADMIN_EMAIL`/`ADMIN_PASSWORD` fallback)
- **Reproduction (verified live, read-only, single login attempt, no further action taken):**
  - Logged in to `https://01hh.vercel.app/login` with `admin@ai-sana.kz` / `AiSanaAdmin2026!` → landed on `/home` as admin. **This worked on production during this audit.**
- **Root cause:** `const ownerAdminPassword = process.env.ADMIN_PASSWORD ?? "AiSanaAdmin2026!";` — the fallback value is hardcoded in a **public** GitHub repository. The admin account bypass (`if (email === ownerAdminEmail) return ownerAdminAccount;`) applies unconditionally, regardless of whether Supabase is configured.
- **Why I didn't "fix" this in code:** Removing the fallback would lock the owner out of their own admin account with no warning if the env var isn't set, which is worse than the current state in a different way. The correct fix is operational, not code: **set real values for `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel now.**
- **Recommended fix:** In Vercel → Project → Settings → Environment Variables, set `ADMIN_PASSWORD` to a strong, unique, random value (and `SESSION_SECRET` from CRIT-01) for Production, then redeploy. Change the admin password again afterward if there's any chance it was used/logged anywhere.

---

## High Issues

### HIGH-01 — Weak password storage
- **Severity:** 🟠 HIGH | **Category:** Authentication
- **Affected file:** `src/lib/supabase-db.server.ts` (`hashPassword`), `src/lib/account-store.server.ts` (in-memory fallback path)
- When Supabase is configured, passwords are hashed with unsalted `SHA-256` (`createHash("sha256").update(password).digest("hex")`) — fast, unsalted, vulnerable to rainbow-table/brute-force attacks if the `users` table is ever exposed. When Supabase is **not** configured, passwords are stored and compared **in plaintext** in the in-memory `Map`.
- **Recommended fix:** Use `bcrypt` or `argon2` with a per-user salt for the Supabase path. For the in-memory fallback, at minimum apply the same hash function used for Supabase so the two paths aren't wildly different in risk.

### HIGH-02 — In-memory data store has no persistence guarantee
- **Severity:** 🟠 HIGH | **Category:** Production Configuration / Data Loss
- **Affected file:** `src/lib/account-store.server.ts`
- When `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are not set, **all accounts, payments, and progress live in a JS `Map` in server memory**. On Vercel's serverless functions, there is no guarantee that memory persists between invocations — a cold start can silently reset every registered user. **I could not determine from outside the deployment whether Supabase is actually configured in production** (the `/admin/payments` 500 error hints it might be, since a Supabase query failure would produce exactly that symptom — but this needs confirming from your Vercel env var list, not guessing).
- **Recommended fix:** Confirm `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel Production and that the `supabase/schema.sql` migrations have actually been applied to that Supabase project. If they're not set, **do not launch** — every signup would be at risk of silent data loss.

### HIGH-03 — No rate limiting on AI Tutor / paid endpoints
- **Severity:** 🟠 HIGH | **Category:** Abuse / Cost Control
- **Affected file:** `src/routes/api/ai-tutor/chat.ts`, `src/routes/api/chat.ts`, `src/routes/api/tts.ts`
- These endpoints correctly check auth/subscription server-side (this part is done right), but nothing limits how many requests a single authenticated user can fire per minute. Since each call spends real `OPENAI_API_KEY` / Gemini TTS budget, a compromised or malicious account (or a buggy retry loop in the frontend) can run up real costs quickly.
- **Recommended fix:** Add a simple per-user rate limit (even an in-memory sliding window keyed by account id is better than nothing) before launch.

---

## Medium Issues

### MED-01 — Hydration crash on `/pricing`
- **Severity:** 🟡 MEDIUM | **Category:** Correctness / Performance
- **Affected file:** `src/routes/pricing.tsx` (`plan.price.toLocaleString("kk-KZ")`)
- **Reproduction:** Loading `/pricing` in a real browser throws a React hydration error in the console — server renders `9,990`, client re-renders `9 990` (comma vs. space thousands separator), because Node's ICU data and the browser's `Intl` implementation don't agree on `kk-KZ` formatting. React discards the SSR tree and re-renders the whole pricing page client-side, causing a visible flash and wasted SSR work on the page that matters most for conversion.
- **Recommended fix:** Format the price with a fixed, locale-independent function (e.g. manual thousands-separator insertion) instead of relying on `toLocaleString` matching between server and client.

### MED-02 — Paid lesson/diagnostic content ships to every visitor's browser
- **Severity:** 🟡 MEDIUM | **Category:** Content Protection
- **Affected files:** `src/data/subjects.ts`, `src/data/diagnostic-questions.ts`, `src/data/nis-diagnostic-questions.ts`, `src/data/topic-challenge.ts`
- These are plain (non-`.server.ts`) modules imported directly into route components, so they're bundled into the **client** JS (confirmed: `diagnostic-*.js` client chunk is ~458KB, the largest in the app). Page-level access control (redirect if not subscribed) is real, but a technically-inclined free user can read every lesson, every diagnostic question, and every correct answer straight out of browser devtools / view-source, regardless of subscription status.
- **Recommended fix:** Not urgent to fix before launch, but worth knowing: if the actual lesson/question content is commercially sensitive, it needs to move behind a server function (like the vocabulary content already correctly does) rather than shipping as a static client import.

### MED-03 — `/admin/payments` and `/admin/vocabulary` 500 on production
- **Severity:** 🟡 MEDIUM | **Category:** Production Configuration
- Both before and after this audit's fix, `curl https://01hh.vercel.app/admin/payments` returns HTTP 500 rather than a clean response. Post-fix this fails *closed* (no data leaks either way, confirmed), but a 500 instead of a clean auth error suggests something else is misconfigured in production for this route (most likely a Supabase query issue). Needs a look at Vercel's function logs, which I don't have access to.

---

## Low Issues

### LOW-01 — Dead, orphaned `backend/` folder
- **Severity:** 🔵 LOW | **Category:** Codebase Hygiene
- `backend/src/server.ts` is a separate Express app that literally logs `"✅ AulBridge Backend running..."` — leftover from an earlier, differently-named version of this project. It has its own `package.json`, `Dockerfile`, `docker-compose.yml`, and `.env.example` with a completely different auth/DB scheme (JWT, raw Postgres `DATABASE_URL`) that has nothing to do with how the live site actually works (TanStack Start server functions + Supabase REST). It is not referenced anywhere by the deployed app. Recommend deleting it to avoid a future developer (or agent) wasting time thinking it's live infrastructure.

### LOW-02 — Deprecated API usage (dev-time warnings only)
- **Severity:** 🔵 LOW | **Category:** Maintenance
- Every `createServerFn().inputValidator(...)` call across `account.functions.ts` and `vocabulary.functions.ts` logs a deprecation warning (`.validator()` is the current API). No functional impact today; will eventually break on a TanStack Start major version bump.

### LOW-03 — No dedicated Terms of Service page
- **Severity:** 🔵 LOW | **Category:** Legal/Content
- The translation dictionary has a `footer_terms` string ("Terms of Service" / "Қызмет көрсету шарттары") but no `/terms` route exists (`curl` → 404). Either wire it up or remove the dead string. `/privacy` does exist and works.

### LOW-04 (previously fixed this session, noted for completeness)
- Favicon, `robots.txt`, `sitemap.xml`, `og:image`, `html lang`, all-English page titles, English-only public homepage, duplicate/dead profile-page UI, duplicated progress-page right rail, and the copyright year were all found and fixed in earlier turns of this same session — not re-litigated here.

---

## Security Findings
See CRIT-01, CRIT-02, CRIT-03, HIGH-01 above. Additionally verified as **passing**:
- `/api/telegram/webhook` correctly validates a secret token (`isValidTelegramWebhookSecret`) before processing updates — rejects forged Telegram updates.
- `/api/cron/send-weekly-reports` correctly requires `isAuthorizedCronRequest` — not open to the public.
- `/api/ai-tutor/chat` correctly checks `getDashboardAccount` → `canEnterPlatform` → `canAccessContent` server-side before calling the paid OpenAI API — this is the *correct* pattern, and is exactly what the payment endpoints were missing.
- No hardcoded API keys, Supabase service key, or Telegram bot token found in the built **client** JS bundle (checked all `.vercel/output/static/assets/*.js` after a production build) — `.server.ts` suffix convention is working as intended for keeping secrets server-only.
- `.env` is correctly gitignored; only `.env.example` (placeholder values) is committed.
- Cookies: `httpOnly`, `sameSite=lax`, `secure` in production — correct flags (the vulnerability was the unsigned *value*, not these flags).
- IDOR: did not find a way to read another specific user's data by guessing/incrementing an ID once CRIT-01/02 were fixed (payment requests, exam attempts, etc. are all scoped through `getActiveStoredAccount()`).

**Not verified in this environment** (be aware, not "passed"): SQL/NoSQL injection against the real Supabase project (the app uses PostgREST filter syntax with `encodeURIComponent`-escaped values, which looks safe, but I didn't have a live Supabase project to attack-test), CSRF (server functions are same-origin POST with `sameSite=lax` cookies, which mitigates classic CSRF, but not independently penetration-tested), and brute-force/lockout behavior on `/login` (no lockout or rate limit was found in the code, so repeated password guessing is not currently throttled — worth adding, not blocking).

## Payment Findings
- **Kaspi Pay is not an automated integration.** There is no Kaspi API call anywhere in the codebase. The flow is: student picks a plan → a `pending` request row is created → an admin manually verifies the Kaspi transaction *outside* the system and clicks Approve/Reject in `/admin/payments`. This is a legitimate MVP approach, but the UI text ("MVP режимі: төлем Kaspi Pay ішінде тексеріледі...") already says this honestly, which is good — just flagging it explicitly per your request.
- The self-approval / zero-auth bypass (CRIT-02) is fixed and verified.
- No idempotency issue found beyond the auth gap: `updatePaymentRequest` is a simple state transition keyed by request id, and double-approving the same already-approved request just extends the subscription again from "now" rather than stacking — minor, not launch-blocking, but worth a follow-up ticket (an admin double-clicking Approve shouldn't reset the subscription clock).

## Authentication Findings
Covered in CRIT-01, CRIT-03, HIGH-01. Registration/login field validation (zod schemas) is solid: email format, password min-length 6, required parent fields all enforced server-side, not just client-side. Duplicate email and duplicate parent-phone are both correctly rejected with a real server-side lookup (not just a client check).

## Authorization Findings
Covered in CRIT-02. Route-level "gates" (`isProtectedBeforeLogin`, `isProtectedBeforeTelegram`, `isProtectedBeforeDiagnostic`, `isPaidRoute` in `gamified-platform.tsx`) are **client-side only** (a `useEffect` that redirects after the page has already loaded). For most pages this is backed up by real server-side checks in the loaders/server functions (verified for AI tutor, diagnostic save, exam save — all correctly call `getActiveStoredAccount()`/`canAccessContent`). The admin routes were the exception, now fixed.

## UX/UI Findings
- Confirmed via live browser test: registration form, direct-URL access to gated pages (`/pricing`, `/home` without Telegram verification) correctly bounce an unverified user to `/verify-parent-telegram`.
- MED-01 hydration crash on `/pricing`.
- **Not exhaustively tested in this pass:** Safari (not available in this Linux/Windows test environment), Firefox (time did not allow a full second-browser pass beyond the Chromium-based testing already done), and full manual mobile/tablet/desktop visual QA across every page in all three languages. This is a real gap — flagging honestly rather than claiming coverage I don't have.

## Performance Findings
- Production build succeeds cleanly (`vite build`, no errors).
- Largest client chunk is `diagnostic-*.js` at ~458KB uncompressed (~49KB gzipped per earlier build output) — acceptable but worth watching as content grows (see MED-02).
- `@google/genai` (Gemini SDK) correctly stays server-only, not bundled to client.
- Did not run a full Lighthouse/Core Web Vitals pass or load-test concurrent users in this session.

## Production Configuration
- ✅ `.env` gitignored, secrets not in client bundle, production build passes.
- ✅ `robots.txt`, `sitemap.xml`, favicon, `og:image`, page titles all localized (fixed earlier this session).
- ⚠️ `SESSION_SECRET`, `ADMIN_PASSWORD` must be set in Vercel now (CRIT-01/03).
- ⚠️ Confirm `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are actually set in Production, or every account risks disappearing (HIGH-02).
- ⚠️ `backend/` folder should be deleted or clearly marked unused (LOW-01).
- ❓ CORS: no explicit CORS headers found on the TanStack Start API routes (they're same-origin by default under this architecture, so this is likely fine, but wasn't independently cross-origin-tested).

## Tested User Flows
- Registration form (new account, field validation) — via real browser.
- Direct URL access to `/pricing`, `/home` before Telegram verification — correctly blocked.
- Full payment-request-creation flow (`/pricing` → Kaspi button → `/payment`) — works, creates a real pending record.
- Admin login with default credentials — works (this is CRIT-03).
- Anonymous/forged-session access to `/admin/payments` — blocked after fix, was wide open before.
- Non-admin authenticated access to `/admin/payments` — correctly blocked after fix.

## Failed Tests
- Session cookie forgery → unauthorized full account access (pre-fix). **Now fixed.**
- Unauthenticated payment approval / PII listing (pre-fix). **Now fixed.**
- Default admin credentials login on production. **Still failing — needs your action.**
- `/pricing` hydration (React console error every load).
- `/admin/payments`, `/admin/vocabulary` return HTTP 500 on production (MED-03).

## Passed Tests
- Registration field validation (email format, password length, duplicate email/phone) — server-enforced.
- Telegram/diagnostic/pricing gating for a brand-new unverified account — correctly redirects.
- AI Tutor endpoint auth + subscription check — correctly server-enforced.
- Telegram webhook secret validation — correctly enforced.
- Cron endpoint authorization — correctly enforced.
- No secrets found in the client JS bundle after a production build.
- Regression: legitimate admin and legitimate non-admin sessions both behave correctly after the CRIT-01/02 fixes.

## Recommended Fixes
1. **Right now:** Set `ADMIN_PASSWORD` (strong, unique) and `SESSION_SECRET` (long random string) in Vercel → Production environment variables, then redeploy.
2. Confirm Supabase env vars are actually set in Production and that the schema in `supabase/schema.sql` matches what's live (HIGH-02) — this determines whether user data can silently vanish.
3. Move password hashing to bcrypt/argon2 with per-user salt (HIGH-01).
4. Add basic per-user rate limiting to the AI endpoints (HIGH-03).
5. Fix the `/pricing` price-formatting hydration mismatch (MED-01).
6. Investigate the production 500 on `/admin/payments`/`/admin/vocabulary` via Vercel logs (MED-03).
7. Delete or clearly quarantine the `backend/` folder (LOW-01).

## Final Launch Decision

## 🛑 NOT READY FOR LAUNCH

until `ADMIN_PASSWORD` and `SESSION_SECRET` are set in production (CRIT-03) — everything else that made this a hard blocker (CRIT-01, CRIT-02) has been fixed and verified in this session. Once those two environment variables are set and Supabase persistence is confirmed (HIGH-02), this moves to **READY WITH CONDITIONS**, with HIGH-01 and HIGH-03 as the next priority before real money starts moving through the system.

---

## ТОП-5 вещей, которые нужно исправить перед запуском

1. **Установи `ADMIN_PASSWORD` и `SESSION_SECRET` в Vercel прямо сейчас.** Дефолтный admin-пароль подтверждённо работает на проде — это самое срочное.
2. **Проверь, что Supabase реально настроен в проде** (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`) — иначе данные пользователей могут исчезать между запросами.
3. Хэширование паролей — перейти на bcrypt/argon2 с солью вместо голого SHA-256 (Supabase-режим) / plaintext (in-memory режим).
4. Добавить rate limiting на AI Tutor и другие AI-эндпоинты — иначе расходы на OpenAI/Gemini не ограничены.
5. Починить hydration-краш на `/pricing` (несовпадение форматирования цены сервер/клиент) — сейчас это самая важная для конверсии страница ломается в консоли при каждой загрузке.
