-- Update Cashier Role Permissions
-- This SQL script updates the cashier role to grant access to dip_stock and cylinder_operations pages
-- Run this on your production database to update existing cashier users

UPDATE roles
SET permissions = JSON_SET(
    permissions,
    '$.pump', JSON_ARRAY('daily_operations', 'credit_sales', 'dip_stock', 'cylinder_operations')
)
WHERE name = 'cashier';

-- Verify the update
SELECT name, displayName, permissions 
FROM roles 
WHERE name = 'cashier';
