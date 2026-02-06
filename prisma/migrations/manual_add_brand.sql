-- Add brand column to cylinder_types table
ALTER TABLE `cylinder_types` ADD COLUMN `brand` VARCHAR(50) NULL AFTER `name`;
