# Fix: AI Support Assistant "temporarily unavailable"

## Diagnosis (verified)
- Symptom (from customer screenshot): "Our AI assistant is temporarily unavailable. Please try again in a moment..." in the support chat widget.
- That exact string lives ONLY in the widget's `catch` block (`AIChatWidget.tsx:105`) — it fires when `fetch()` rejects or `res.json()` throws, i.e. the function returned **non-JSON** (504 timeout / crash). Every API error path returns valid JSON with different wording.
- Ruled OUT by direct testing:
  - Model `claude-sonnet-4-20250514` → HTTP 200 (not retired).
  - Production `ANTHROPIC_API_KEY` (pulled from Vercel) → HTTP 200, has credit, same as local.
  - Latest prod deploy → ● Ready (build OK).
  - Live `/api/ai/chat` → 401 without session (deployed & reachable).
  - Supabase REST → 0.16s healthy.
- Root cause: nested retries. Anthropic SDK defaults `maxRetries=2`, `timeout=10min`, retries timeouts. `generateAIResponse` wraps that in its OWN 3-attempt loop. During a 529 overload spike the request runs past the Vercel function budget → non-JSON 504 → widget shows "unavailable".

## Fix
- [ ] `ai.ts`: construct Anthropic client with `maxRetries: 0` (manual loop owns retries — no multiplicative stacking).
- [ ] `ai.ts`: pass a per-request `timeout` (15s) to `messages.create` so a single call can't hang.
- [ ] `ai.ts`: treat timeout/connection errors as retryable in the catch (so they get the friendly "busy" JSON, not a hard throw).
- [ ] `route.ts`: add `export const maxDuration = 60` to define the function budget; worst-case path (~48s) finishes under it and always returns JSON.

## Verify
- [ ] `npm run build` / typecheck passes.
- [ ] Bounded worst-case wall clock < maxDuration.

## Review
- Done: `ai.ts` client now `maxRetries: 0`; `messages.create` gets a 15s per-request
  `timeout`; catch treats timeout/connection errors as retryable → friendly "busy" JSON.
- Done: `route.ts` exports `maxDuration = 60`.
- Verified: `tsc --noEmit` exit 0; eslint clean on both files.
- Worst-case wall clock: 15 + 1 + 15 + 2 + 15 ≈ 48s < 60s maxDuration → function always
  returns JSON, so the widget shows "temporarily busy" (accurate) instead of the
  504-induced "temporarily unavailable".
- NOT changed: model `claude-sonnet-4-20250514` (verified working; newer is `claude-sonnet-4-6`
  if you want to upgrade later — separate decision).
- Pending: deploy to production for the fix to take effect (no auto-deploy without ask).
