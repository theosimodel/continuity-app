# Metrics Specification — Continuity (v1)

This document defines the **source of truth, calculation rules, and display behavior** for all reader-facing metrics in Continuity.

These metrics are intentionally conservative and derive only from **deliberate user actions** inside the product.

---

## 1. Core Principle (Locked)

> **Continuity metrics are derived exclusively from deliberate reader actions inside Continuity.**

No external scraping. No inferred popularity. No third-party averages.

---

## 2. Continuity Count

### Label

```
12,483 in Continuity
```

### Definition

The number of **unique users** who have committed a work to their Continuity.

### Inclusion Rules (Option A — Locked)

A work counts as **in Continuity** if **either** of the following states are present:

- `read`
- `reread`

### Explicit Exclusions

- `owned` **does not** count toward Continuity
- `want` **does not** count toward Continuity

Ownership alone is not considered commitment.

### Calculation

```
COUNT(DISTINCT user_id)
WHERE work_id = X
AND continuity_state IN ('read', 'reread')
```

### Rationale

- Keeps Continuity focused on *memory*, not acquisition
- Avoids inflated counts from backlog collecting
- Reinforces trust in the metric

---

## 3. Rating

### Purpose

Indicate how a work landed **among readers who actually read it**.

### Definition

The average rating from users who:

- Added the work to Continuity via `read` or `reread`
- Explicitly submitted a rating

### Calculation

```
AVG(user_rating)
WHERE work_id = X
AND continuity_state IN ('read', 'reread')
AND rating IS NOT NULL
```

### Display Threshold

Ratings are only shown once a minimum number of ratings exist.

**Recommended threshold:** 5–10 ratings

### UI States

- Below threshold:
  ```
  Rating
  —
  ```

- Above threshold:
  ```
  ★★★★☆
  3.9
  ```

### Explicit Exclusions

- No external ratings (IMDb, Goodreads, etc.)
- No ratings from `owned` or `want` states

---

## 4. Relationship Between Metrics

| Metric | Meaning |
|------|--------|
| In Continuity | How many readers committed this work to memory |
| Rating | How it landed *among those readers* |

These metrics are complementary, not competitive.

---

## 5. Early Data Philosophy

- An empty Rating is acceptable and intentional
- Low numbers signal honesty, not failure
- Trust is prioritized over perceived completeness

---

## 6. Future Considerations (Not v1)

- Weighted ratings (rereads count more)
- Confidence indicators ("Based on 27 readers")
- Time-based decay

These are explicitly deferred.

---

**metrics-spec.md — Continuity**

