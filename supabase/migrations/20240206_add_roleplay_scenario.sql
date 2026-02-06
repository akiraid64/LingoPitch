-- Add roleplay_scenario column to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS roleplay_scenario TEXT;

-- Update RLS policies to allow managers to update organization settings
-- (Assuming organizations have an owner_id or similar, Adjust as per your schema)
-- If you have a specific policy for managers, ensure they have UPDATE access.

COMMENT ON COLUMN organizations.roleplay_scenario IS 'The dynamically generated AI roleplay scenario/persona based on the product description.';