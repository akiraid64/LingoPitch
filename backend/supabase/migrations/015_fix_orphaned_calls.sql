-- 1. Verify the User's Role and Org
-- This should show role: 'rep' and org_id: '5fe8a2f3-e7ec-43e9-ae6f-53f6221546e8'
SELECT id, full_name, email, role, org_id
FROM profiles
WHERE
    id = '3ff5c082-913f-479f-a386-0f1fe35e00d1';

-- 2. Check the orphaned calls (calls with no org_id)
SELECT
    id,
    title,
    created_at,
    user_id,
    org_id
FROM calls
WHERE
    user_id = '3ff5c082-913f-479f-a386-0f1fe35e00d1';

-- 3. FIX: Link these calls to the organization
-- This allows the Manager (who belongs to this Org) to see them via RLS.
UPDATE calls
SET
    org_id = '5fe8a2f3-e7ec-43e9-ae6f-53f6221546e8'
WHERE
    user_id = '3ff5c082-913f-479f-a386-0f1fe35e00d1'
    AND org_id IS NULL;

-- 4. Verify the fix
SELECT id, title, org_id
FROM calls
WHERE
    user_id = '3ff5c082-913f-479f-a386-0f1fe35e00d1';