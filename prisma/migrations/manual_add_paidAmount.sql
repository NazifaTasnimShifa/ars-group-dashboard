-- Add paidAmount column to sales table
ALTER TABLE `sales` ADD COLUMN `paidAmount` DECIMAL(15,2) DEFAULT 0.00 AFTER `totalAmount`;

-- Add paidAmount column to purchases table  
ALTER TABLE `purchases` ADD COLUMN `paidAmount` DECIMAL(15,2) DEFAULT 0.00 AFTER `amount`;
