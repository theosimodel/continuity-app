# Navigation — Signed-In State Acknowledgement (v1)

This document defines how Continuity acknowledges a signed-in user **without notifications, alerts, or messaging**.

The solution preserves Continuity’s calm, editorial tone while clearly confirming authentication state.

---

## 1. Problem Being Solved

After sign-in, the navigation currently:

- Appears identical to the signed-out state
- Provides no confirmation of authentication
- Creates uncertainty about session state and ownership

Users may subconsciously ask:

> “Did sign-in work?”  
> “Whose Continuity am I viewing?”

Continuity must acknowledge sign-in **without announcing it**.

---

## 2. Core Principle

**Identity is the confirmation.**

Continuity does not use:

- Toast notifications
- Status banners
- Alerts or bells
- Explicit “Signed in” messaging

Instead, sign-in is acknowledged by **activating the Identity affordance** in the navigation.

---

## 3. Signed-Out Navigation State

When the user is signed out:

```
HQ | LONG BOXES | CONTINUITY | IDENTITY (generic icon)
```

Rules:

- Identity icon is neutral
- No accent color
- No avatar or sigil
- No hover identity cues

---

## 4. Signed-In Navigation State (Locked)

When the user is signed in:

```
HQ | LONG BOXES | CONTINUITY | [ USER SIGIL ]
```

### Behavior

- The generic Identity icon is replaced by the user’s selected sigil
- The sigil occupies the same size and alignment as the nav icon
- No additional text is shown
- No animation is required

This visual change alone confirms authentication.

---

## 5. Visual Treatment Rules

- Sigil uses the same accent color as active navigation states
- Brightness increase is subtle
- No outlines, badges, rings, or highlights
- Baseline and spacing match other nav items exactly

The sigil should feel *present*, not emphasized.

---

## 6. Hover Behavior (Optional)

On hover only:

- A tooltip may display the username
- No dropdown menu
- No persistent label

This enhancement is optional and may be deferred.

---

## 7. Explicit Exclusions

The navigation must never include:

- ❌ Notification bells
- ❌ “Signed in” messages
- ❌ Toast confirmations
- ❌ Account dropdown menus
- ❌ Welcome banners

Sign-in acknowledgement must remain silent and editorial.

---

## 8. First-Time Sign-In (Optional Enhancement)

If a one-time acknowledgement is desired:

- The Identity sigil may fade in using the accent color
- No text
- No repetition on future sessions

This is optional and not required for v1.

---

## 9. Design Intent Check

Ask:

> *Can a user tell they’re signed in without being told?*

If yes, the implementation is correct.

---

## 10. Summary (Locked)

- Sign-in is acknowledged through Identity
- Identity sigil replaces the generic nav icon
- No notifications or messaging
- Calm, editorial confirmation only

---

**navigation-signed-in-state-v1.md — Continuity**