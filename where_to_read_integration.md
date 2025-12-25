# Where to Read — Integration & Governance (v1)

This document consolidates **cross-references, implementation rules, and governance** for the *Where to Read* feature in Continuity.

It exists to prevent commercial creep and to ensure availability information remains **editorial, neutral, and accurate**.

---

## 1. Purpose

*Where to Read* answers a single user question:

> *How can I actually read this comic?*

It does so **without** turning Continuity into a store, marketplace, or affiliate surface.

---

## 2. Scope

This document applies to:
- Comic Detail pages
- Editorial curation (Picks)
- Any future surface that displays reading availability

It does **not** apply to:
- Comic cards (grid/list views)
- Landing pages
- Marketing materials

---

## 3. Cross-References (Authoritative)

Read this document alongside:

- `comic-detail-v1-interim.md` — Current Comic Detail behavior
- `comic-detail-v1-final.md` — Future-state behavior (auto-add)
- `hq-picks-and-welcome.md` — Editorial tone and onboarding
- `comic-cards-where-to-read.md` — Primary Where to Read spec

*Where to Read* is a **supporting editorial element**, never a primary action.

---

## 4. Placement Rules (Locked)

- *Where to Read* appears **only** on the Comic Detail page
- It is placed **after Story Brief** and **before Add to your Continuity**
- It never appears on comic cards or discovery grids

This mirrors the reader’s intent flow:
1. What is this?
2. Why does it matter?
3. How can I read it?
4. Does it belong in my Continuity?

---

## 5. Language Rules (Locked)

Only approved, neutral phrasing may be used.

### Approved Examples

- Available on DC Universe Infinite
- Available on Marvel Unlimited
- Available to borrow via Hoopla with a public library card
- Available to borrow via public libraries
- Available for purchase from major digital retailers
- Print editions available

### Explicitly Avoid

- Buy / Read now
- Best place to read
- Free / Cheapest
- Urgency language
- Affiliate phrasing

---

## 6. Internal Implementation Checklist

Before publishing or updating *Where to Read* data, verify:

- [ ] Availability information is factual and current
- [ ] Language uses only approved phrasing
- [ ] No pricing or promotional language is present
- [ ] No platform is visually or textually prioritized
- [ ] Library access is listed when applicable
- [ ] Purchase is listed neutrally if required

If any item cannot be verified, use the fallback below.

---

## 7. Fallback Pattern (Required)

When availability cannot be confidently verified:

```
WHERE TO READ
Availability varies by region and format.
```

This is preferred over omission or guesswork.

---

## 8. Governance Notes

- Availability data should be reviewed periodically
- Accuracy matters more than completeness
- Editorial trust outweighs convenience

---

## 9. Summary

- *Where to Read* is informational, not transactional
- It lives only on Comic Detail pages
- Language is calm, neutral, and factual
- Governance rules protect Continuity’s identity

---

**where-to-read-integration.md — Continuity**

