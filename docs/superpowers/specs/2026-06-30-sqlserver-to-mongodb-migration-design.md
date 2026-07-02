# SQL Server → MongoDB Migration (yuvabharat → swara)

Date: 2026-06-30

## Goal
Import legacy `yuvabharat` (SQL Server 2022 in Docker) data into the new `swara`
MongoDB database, mapped field-by-field onto the existing Mongoose models.

## Source / Target
- Source: SQL Server `yuvabharat`, container `sqlserver`, `localhost:1433`, user `sa`.
- Target: `mongodb://127.0.0.1:27017/swara` (local MongoDB Community 5.0).
- Mode: **wipe each target collection, then insert** (fresh, repeatable import).
- Approach: one-off TypeScript script run with `tsx`, reusing `backend/src/models`
  so schema defaults, slug rules, indexes, and bcrypt hashing apply. SQL read via
  the `mssql` npm driver (added as a backend dependency).

## ID strategy
Legacy integer PKs map to generated ObjectIds via in-memory maps, built
parents-first so FKs resolve:
- `catMap[CatId]` (v_Categories), `ghoshMap[GhoshCatID]` (V_GhoshCategory)
- `fileSongMap[FileID]` (V_Files) — used by comments and plays

## Collection mapping (in dependency order)

1. **categories** ← `v_Categories` (7) + `V_GhoshCategory` (2)
   - CatName→name, CatDesc→description, slug from name, order from CatId.
2. **songs** ← `V_Files` (428) + `V_Rachana` (55)
   - V_Files: FileTitle→title, FileName→audioFile, FileCatID→category(catMap),
     FileLanID→languages[] (via V_Languages lookup), FileHits→playCount,
     FileDownloadCount→downloadCount, FileAuthor→singer, FileStatus→status,
     FileDOC→createdAt/publishedAt.
   - V_Rachana: RachanaName→title, RachanaFileName→audioFile,
     RachanaCatID→category(ghoshMap), RachanaHits→playCount,
     RachanaDownloads→downloadCount, RachanaDOC→dates.
3. **songComments** (2,625) ← `V_Comments`
   - FileID→song(fileSongMap), Name→name, Email→email, Comment→comment,
     Status(int)→{0:pending,1:approved,2:rejected}, DateCreated→createdAt,
     IPAddress→sha256 ipHash.
4. **songPlays** (108,702) ← `V_Embed`
   - EmbedFileID→song(fileSongMap), IP→sha256 ipHash,
     dateBucket = linked song's file date (YYYY-MM-DD); batched inserts.
5. **admins** (10) ← `V_Users`
   - UName→username, UEmail→email, role 'ADMIN', UPassword→bcrypt(passwordHash),
     UCreation→createdAt, ULastLogin→lastLoginAt. Dedup username/email.
6. **documents** (25) ← `V_Downloads`
   - DownloadName→title, DownloadFileName→filePath, FileSize→size, type 'download'.
7. **quotes** (365) ← `V_Quotes`
   - QDesc→text, QPerson→author, QStatus→isActive, mode 'random'.
8. **calendarEvents** (366) ← `V_Calendar`
   - Edate→month/day/year, SignificanceDesc/TTithi→name, SignificanceDesc→description.

## Skipped (no meaningful target)
`V_SongStats` (ratings — no Song rating field), `V_Ringtones`, `V_Subscription`,
`V_BLIPAddress`, `V_Settings`, `tmpJsonTable`. `SongLyrics` not populated (legacy
stores lyric image filenames, not text). `V_Languages` used as lookup only.

## Verification
After import, compare collection counts against expected source counts and spot
check a song with its category, a comment's song ref, and an admin login hash.
