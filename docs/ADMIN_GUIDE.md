# ADMIN GUIDE — Vijayavipanchi

The admin panel lives at **`/admin`**. Public visitors never need to log in; only admins do.

## Signing in

1. Go to `http://localhost:3000/admin`.
2. Enter the username/password from `backend/.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`,
   default `admin` / `Admin@12345`).
3. You'll land on the **Dashboard**. Sessions use a secure httpOnly cookie; click **Logout** when done.

> Change the default password: set `ADMIN_PASSWORD` in `backend/.env` and re-run `npm run seed`
> (note: seeding resets all content). For an existing deployment, update the password hash via a
> small script or reseed on a fresh DB.

---

## Dashboard

Shows totals (songs, videos, articles, events, comments), **pending comments** needing
moderation, **plays today / this month**, **storage used**, your most-played songs, and recent
admin activity (from the audit log).

---

## Songs

**Songs → New Song**
- Title and Category are required. Optionally set Singer / Composer / Lyricist, Tags, Status
  (Published/Draft), and **Featured** / **Top 5** flags.
- Upload an **audio file** (mp3/wav/ogg/m4a/…) and a **cover image**. Files are validated by type
  and size (`MAX_UPLOAD_MB`) and stored locally under `data/`.
- Click a song's **Edit** to change details, replace the audio/cover, and **manage lyrics**.

**Lyrics (inside a song's Edit page)**
- **Add language** → enter Language (e.g. *Telugu*), Code (e.g. `te`), optional Script, and the
  lyrics text. Tick **Default** to make it the first tab shown to visitors.
- Each language has Save / Delete. Add as many languages as you like — they appear as tabs and in
  the side-by-side comparison on the public song page.

**Delete** a song to remove it along with its lyrics, comments, and play/download records.

---

## Categories

Create/edit/delete categories (name, description, order, optional cover image). A category can't be
deleted while songs still reference it — reassign those songs first.

---

## Events

**Events → New event**: Title and Start date/time are required; add End date, Location, Link,
Status, a Banner image, and a Description.
- **Edit** loads the event into the form (heading changes to *Edit event*); change anything and
  click **Update event**.
- **Delete** removes the event.

Published, future-dated events appear in the homepage **Upcoming Events** section.

---

## Comments (moderation)

Visitor comments are submitted with a CAPTCHA and arrive as **Pending** — they are *not* shown
publicly until you approve them.

- Tabs filter by **Pending / Approved / Rejected / All**; the Pending tab shows a count badge.
- **Approve** publishes the comment; **Reject** hides it; **Delete** removes it permanently.

---

## Tips

- The **theme toggle** (sun/moon) switches light/dark for the admin UI.
- **View site →** opens the public site in the same browser.
- Every create/update/delete is written to `logs/audit.log` with your username and IP.
- Storage lives entirely under `data/` — see BACKUP_GUIDE.md to protect it.
