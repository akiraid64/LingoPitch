# RLS DIAGNOSTIC SUMMARY

## Issue Found: Multiple Conflicting Policies

Your migrations folder has **MULTIPLE FILES** trying to create policies on the same tables:

### Organizations Table Policies Found In:
1. `001_initial_schema.sql` - (OLD, should not apply to new schema)
2. `002_organizations_referral.sql` - Creates:
   - "Organizations are viewable by everyone"
   - "Allow organization creation during signup" 
   - "Owners can update their organization"
   - "Service role can manage organizations"
3. `006_complete_production_schema.sql` - Creates:
   - "Users can view their organization"
4. `008_complete_rls_fix.sql` - Creates:
   - "Users can view their organization"
   - "Service role can manage organizations"
   - "Allow org creation"
5. `009_fix_org_rls.sql` - Creates:
   - "Allow organization creation"
   - "Users can view own organization"
   - "Owners can update organization"

## The Problem

**Migration 002** likely ran BEFORE **migration 006** which means there's a policy from migration 002 that:
- **DOES NOT** allow INSERT with `WITH CHECK (true)`
- Is still active in the database
- Is OVERRIDING the new policies from migration 009

## The Fix

Run this SQL to see which policy is actually active:

```sql
SELECT policyname, cmd, with_check, qual
FROM pg_policies 
WHERE tablename = 'organizations' 
ORDER BY policyname;
```

Then run this DEFINITIVE fix that drops ALL policies and creates ONLY the correct one:

```sql
-- FINAL FIX: Drop absolutely everything and start fresh
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'organizations'
    LOOP
        EXECUTE format('DROP POLICY %I ON organizations', pol.policyname);
    END LOOP;
END $$;

-- Disable and re-enable RLS to clear cache
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create ONE simple INSERT policy
CREATE POLICY "allow_insert_for_authenticated_users" 
ON organizations 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create SELECT policy
CREATE POLICY "allow_select_own_org" 
ON organizations 
FOR SELECT 
USING (owner_id = auth.uid());

-- Reload PostgREST
NOTIFY pgrst, 'reload schema';
```

## Next Steps

1. **Run the SQL above** in Supabase SQL Editor
2. **Run the PowerShell test**: `.\test_rls_quick.ps1`
3. This will tell us if the issue is:
   - ✅ Fixed (200 OK with auth token)
   - ❌ Still broken (Supabase client auth issue)
