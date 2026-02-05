-- Add product_description to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS product_description TEXT;