# Share Experience Specification (v1)

This document defines the **canonical share behavior** for Continuity.
Sharing is a core growth loop and must feel **personal, intentional, and authored** — never generic.

---

## 1. Core Principle

> **If the user writes a message, it must be shared.**

A share UI that accepts input but does not transmit it is considered **broken**, even if technically functional.

---

## 2. Supported Share Types

Continuity supports three share paths in v1:

1. Native Share (Messages, system share sheet)
2. Copy Link
3. Share to X (Twitter)

Each has different constraints but must follow consistent rules.

---

## 3. Share Modal Structure (Locked)

### Required Elements

1. Shared object preview
   - Cover image (if applicable)
   - Title
   - Author (“By {username}”)
   - Visibility state (Public / Unlisted)

2. **Message input (optional but functional)**

3. Action buttons:
   - Copy Link
   - Share to X
   - Messages / Native Share

---

## 4. Message Input Rules

### Behavior

- The message field is **optional**
- If populated, it **must be included** in the shared payload
- If empty, a default message is injected

### Never Allowed

- Message field that only affects UI
- Ignoring user-entered text
- Falling back to page metadata when a message exists

---

## 5. Native Share (Messages, iOS / macOS / Android)

### Required Payload

```ts
navigator.share({
  title: shareTitle,
  text: shareMessage,
  url: shareUrl
})
```

### Message Resolution Logic

1. If user entered a message → use it verbatim
2. Else → inject default share copy (see Section 8)

### Expected Result (Messages)

Read This Now!! or Else 😤

Continuity — Todd’s Must Read Batman Comics  
https://continuity.app/list/xyz

---

## 6. Copy Link Behavior

- Copies **URL only**
- Does NOT include message text
- No preview text required

This is intentional and expected.

---

## 7. Share to X (Twitter)

### Requirements

- Pre-fill tweet text
- Include URL
- Respect character limits

### Format

{message or default copy}

{url}

### If message exceeds limit

- Truncate message
- Preserve URL
- Never silently fail

---

## 8. Default Share Copy (When Message Is Empty)

Default copy must sound **human**, not technical.

### Approved Defaults

- “A reading list I made on Continuity.”
- “Thought you’d like this comic reading path.”
- “Sharing a comic list from Continuity.”

### Explicitly Forbidden

- “Continuity — A curated reading path”
- Page titles
- Meta descriptions
- Internal product language

---

## 9. Share Preview (UX Requirement)

The Share modal should visually imply:

> “Your message and link will be shared together.”

This may be done via:
- Subtle helper text
- Preview section
- Placeholder copy

Purpose: **build trust and prevent confusion**

---

## 10. Failure States (Must Not Ship)

The following are considered launch blockers:

- Message field does not affect share output
- Shared Messages show only page title
- Share feels identical to copying a raw link
- User cannot tell their voice was included

---

## 11. Product Philosophy

Sharing is not marketing.

It is **recommendation between people**.

Continuity shares should feel:
- Personal
- Authored
- Intentional
- Worth clicking

---

**share-experience-spec.md — Continuity**
