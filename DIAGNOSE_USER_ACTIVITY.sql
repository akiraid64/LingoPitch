-- ==============================================================================
-- 🕵️‍♂️ USER ACTIVITY DIAGNOSTIC REPORT
-- Run this script in the Supabase SQL Editor to see "who is doing what".
-- ==============================================================================

-- 1. 👥 USERS SUMMARY
-- Lists all users, their roles, and which organization they belong to.
SELECT p.full_name AS "Name", p.email AS "Email", p.role AS "Role", o.name AS "Organization", p.id AS "User ID", p.org_id AS "Org ID"
FROM profiles p
    LEFT JOIN organizations o ON p.org_id = o.id
ORDER BY o.name, p.role;

-- 2. 📊 CALLS SUMMARY PER USER
-- Shows how many calls each user has made.
SELECT p.full_name AS "User", COUNT(c.id) AS "Total Calls", MAX(c.created_at) AS "Last Call Date", COUNT(c.id) FILTER (
        WHERE
            c.org_id IS NULL
    ) AS "Orphaned Calls (No Org)"
FROM profiles p
    LEFT JOIN calls c ON p.id = c.user_id
GROUP BY
    p.id,
    p.full_name
ORDER BY "Total Calls" DESC;

-- 3. 📝 RECENT ACTIVITY LOG (Last 10 Calls)
-- Shows the most recent calls across the system and if they are linked correctly.
SELECT
    c.title AS "Call",
    p.full_name AS "User",
    c.created_at AS "Date",
    CASE
        WHEN c.org_id IS NULL THEN '⚠️ ORPHANED (No Org)'
        WHEN c.org_id = p.org_id THEN '✅ Linked Correctly'
        ELSE '❌ ORG MISMATCH'
    END AS "Status",
    c.id AS "Call ID"
FROM calls c
    JOIN profiles p ON c.user_id = p.id
ORDER BY c.created_at DESC
LIMIT 10;