# ARS ERP Dashboard - Complete Implementation Plan

## Executive Summary

This document outlines the complete implementation plan for the ARS Business Management System, serving two distinct businesses:
1. **ARS Corporation** - Petrol Pump Operations
2. **ARS Lube** - Lubricant Manufacturing & Distribution

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15 (Pages Router) |
| UI Framework | Tailwind CSS + Headless UI |
| Database | MySQL 8.x |
| ORM | Prisma |
| Authentication | Custom JWT with bcrypt |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Heroicons |

---

## Phase 1: Foundation & Core Setup

### 1.1 Database Schema Redesign

```prisma
// Core Business Entities
- businesses (ARS Corporation, ARS Lube)
- branches (Multiple locations per business)
- users (With role-based access)
- roles & permissions
- audit_logs

// Product & Inventory (Common)
- product_categories
- products
- product_variants
- product_pricing (Multi-tier)
- inventory_stock
- inventory_movements
- batches (For expiry tracking)

// ARS Corporation - Petrol Pump
- fuel_types (Petrol, Diesel, Octane)
- storage_tanks
- tank_dip_readings
- fuel_receipts
- pumps
- nozzles
- meter_readings
- shifts
- shift_assignments
- shift_transactions
- gas_cylinders
- cylinder_customers
- cylinder_deposits
- cylinder_transactions
- process_losses
- loss_claims

// ARS Lube - Lubricant Business
- customers (Distributors, Dealers, Retailers)
- suppliers
- sales_orders
- sales_order_items
- sales_invoices
- sales_invoice_items
- dispatch_notes
- purchase_orders
- purchase_order_items
- goods_receipts
- goods_receipt_items
- sales_returns
- purchase_returns

// Financial Modules (Common)
- chart_of_accounts
- journal_entries
- journal_entry_lines
- ledger_entries
- bank_accounts
- bank_transactions
- cash_books
- fixed_assets
- asset_depreciation
- fixed_costs
- expenses
- debtors_ledger
- creditors_ledger
- payment_receipts
- payment_vouchers

// HR & Payroll
- employees
- departments
- designations
- salary_structures
- attendance_records
- leave_types
- leave_applications
- leave_balances
- salary_advances
- salary_adjustments
- payroll_runs
- payslips
```

### 1.2 User Roles & Access Matrix

| Role | ARS Corp | ARS Lube | Admin Panel | Scope |
|------|----------|----------|-------------|-------|
| Owner | Full | Full | Full | All Businesses |
| Manager (Corp) | Full | None | Limited | Single Business |
| Manager (Lube) | None | Full | Limited | Single Business |
| Pump Operator | Sales Only | None | None | Shift-based |
| Accountant | Financial | Financial | None | Assigned Business |
| Sales Staff | None | Sales Only | None | Assigned Business |
| HR Manager | HR Only | HR Only | None | Assigned Business |

---

## Phase 2: Core Modules

### 2.1 Authentication & Authorization

**Files to create/modify:**
- `src/lib/auth.js` - JWT utilities
- `src/lib/permissions.js` - Permission checks
- `src/middleware.js` - Route protection
- `src/pages/api/auth/[...nextauth].js` - Auth endpoints
- `src/pages/login.js` - Enhanced login
- `src/pages/select-business.js` - Business selection

**Features:**
- Secure password hashing (bcrypt)
- JWT token-based sessions
- Remember me functionality
- Password reset via email
- Two-factor authentication (optional)
- Session timeout
- Audit logging for logins

### 2.2 Business & Branch Management

**Database Tables:**
```sql
businesses:
  - id, code, name, short_name, type (petrol_pump|lubricant)
  - address, phone, email, gstin, pan
  - logo_url, settings (JSON)
  - created_at, updated_at

branches:
  - id, business_id, code, name
  - address, phone, manager_id
  - is_active, settings (JSON)
```

**API Routes:**
- GET/POST `/api/businesses`
- GET/PUT/DELETE `/api/businesses/[id]`
- GET/POST `/api/businesses/[id]/branches`

### 2.3 Master Data Management

**Product Categories:**
- Hierarchical categories (parent-child)
- Category-wise settings (margin, tax, etc.)
- Business-specific categories

**Products:**
- SKU generation
- Multiple variants (pack sizes)
- Multi-tier pricing
- Tax configuration
- Reorder levels
- Product images

**Customers & Suppliers:**
- Contact information
- Credit limits
- Payment terms
- Price list assignment
- Transaction history

---

## Phase 3: ARS Corporation (Petrol Pump)

### 3.1 Tank Management

**Database Tables:**
```sql
storage_tanks:
  - id, branch_id, tank_number, fuel_type_id
  - capacity_liters, current_stock
  - last_calibration_date, next_calibration_date
  - is_active

tank_dip_readings:
  - id, tank_id, reading_date, shift_id
  - opening_dip, closing_dip
  - calculated_stock, physical_stock
  - variance, notes

fuel_receipts:
  - id, tank_id, receipt_date, challan_number
  - tanker_number, driver_name
  - expected_qty, received_qty
  - shortage, notes
  - supplier_id, invoice_amount
```

**Features:**
- Daily dip readings (opening/closing)
- Fuel receipt recording with shortage
- Tank level monitoring with alerts
- Calibration schedule tracking
- Stock reconciliation reports

### 3.2 Pump & Nozzle Management

**Database Tables:**
```sql
pumps:
  - id, branch_id, pump_number
  - make, model, installation_date
  - is_mpu (multi-product unit)
  - is_active

nozzles:
  - id, pump_id, nozzle_number
  - fuel_type_id, tank_id
  - current_meter_reading
  - is_active

meter_readings:
  - id, nozzle_id, reading_date, shift_id
  - opening_reading, closing_reading
  - total_dispensed, test_qty
  - actual_sales_qty
```

**Features:**
- Pump registration with nozzles
- Opening/closing meter readings per shift
- Testing quantity tracking
- Pump-wise sales analysis
- Maintenance scheduling

### 3.3 Shift Management

**Database Tables:**
```sql
shifts:
  - id, branch_id, name (Morning/Evening/Night)
  - start_time, end_time
  - is_active

shift_instances:
  - id, shift_id, date
  - operator_id, supervisor_id
  - status (open/closed/pending)
  - opening_cash, closing_cash
  - total_sales, total_collections
  - shortage, excess

shift_transactions:
  - id, shift_instance_id
  - transaction_type (fuel_sale/lubricant_sale/collection)
  - nozzle_id, payment_mode
  - amount, vehicle_number
  - customer_id (for credit sales)
  - notes
```

**Features:**
- Define shift timings
- Assign operators to shifts
- Shift handover checklist
- Record transactions during shift
- Shift closing with reconciliation
- Shortage/excess calculation
- Operator performance tracking

### 3.4 Sales & Transactions

**Payment Modes:**
- Cash
- Credit (to customer account)
- UPI/QR Payment
- Debit/Credit Card
- Fleet Cards (HPCL, IOCL, BPCL)
- Digital Wallets

**Features:**
- Record sales with payment mode
- Credit sales with customer linking
- Vehicle number capture
- Fleet card reconciliation
- Daily sales summary
- Payment mode-wise reports

### 3.5 Gas Cylinder Operations

**Database Tables:**
```sql
cylinder_types:
  - id, name (Domestic 14.2kg, Commercial 19kg, etc.)
  - deposit_amount, current_price

cylinder_inventory:
  - id, branch_id, cylinder_type_id
  - filled_stock, empty_stock

cylinder_customers:
  - id, name, phone, address
  - deposit_amount, cylinders_with_customer
  - registration_date

cylinder_transactions:
  - id, customer_id, transaction_date
  - transaction_type (issue/return/deposit/refund)
  - cylinder_type_id, quantity
  - amount_collected, receipt_number
```

**Features:**
- Track filled/empty cylinder inventory
- New customer registration with deposit
- Swap transactions (empty for filled)
- Deposit management
- Refund processing
- Cylinder-wise reports

### 3.6 Loss Management

**Types of Losses:**
1. **Process Loss (Evaporation)** - Natural loss during storage/handling
2. **Transit Loss** - Shortage at tanker receipt
3. **Operational Loss** - Spillage, leakage, pump malfunction
4. **Testing Loss** - Fuel used for testing equipment

**Database Tables:**
```sql
loss_configurations:
  - fuel_type_id, permissible_loss_percent
  - seasonal_factors (JSON)

process_losses:
  - id, branch_id, date, fuel_type_id
  - book_stock, physical_stock
  - loss_quantity, loss_percent
  - is_within_limit, notes

loss_claims:
  - id, loss_type, date, fuel_type_id
  - quantity, estimated_value
  - claim_filed_date, claim_number
  - claim_status, recovered_amount
```

---

## Phase 4: ARS Lube (Lubricant Business)

### 4.1 Product Management

**Features:**
- Complete product catalog
- Category hierarchy
- Multiple pack sizes per product
- Technical specifications
- Product images
- HSN codes for GST

### 4.2 Inventory Management

**Database Tables:**
```sql
warehouse_locations:
  - id, branch_id, name, type

inventory_stock:
  - id, product_variant_id, location_id
  - batch_id, quantity, reserved_qty
  - average_cost

batches:
  - id, product_variant_id, batch_number
  - manufacturing_date, expiry_date
  - received_qty, current_qty

inventory_movements:
  - id, type (receipt/sale/transfer/adjustment)
  - product_variant_id, batch_id
  - from_location, to_location
  - quantity, reference_type, reference_id
  - movement_date, user_id
```

**Features:**
- Real-time stock tracking
- Batch-wise inventory
- FIFO enforcement
- Expiry alerts
- Low stock alerts
- Stock valuation

### 4.3 Multi-tier Pricing

**Pricing Tiers:**
1. MRP (Maximum Retail Price)
2. Retailer Price
3. Dealer Price
4. Distributor Price
5. Special/Contract Price

**Features:**
- Price list management
- Customer-specific pricing
- Quantity discounts
- Promotional pricing
- Price history

### 4.4 Sales & Distribution

**Order to Delivery Flow:**
1. Sales Order Creation
2. Credit Check
3. Stock Availability Check
4. Order Approval (if required)
5. Invoice Generation
6. Dispatch Planning
7. Delivery Challan
8. Proof of Delivery
9. Collection/Credit Note

**Database Tables:**
```sql
sales_orders:
  - id, order_number, order_date
  - customer_id, branch_id
  - status, payment_terms
  - subtotal, tax_amount, total_amount
  - notes

sales_order_items:
  - id, order_id, product_variant_id
  - quantity, unit_price, discount
  - tax_rate, tax_amount, line_total

sales_invoices:
  - id, invoice_number, invoice_date
  - order_id, customer_id
  - gstin, e_invoice_number
  - e_way_bill_number
  - payment_status, due_date

dispatch_notes:
  - id, invoice_id, dispatch_date
  - vehicle_number, driver_name
  - transporter_id
  - delivery_status, delivered_at
```

### 4.5 Purchase Management

**Database Tables:**
```sql
purchase_orders:
  - id, po_number, po_date
  - supplier_id, branch_id
  - status, expected_delivery
  - terms, subtotal, tax, total

goods_receipts:
  - id, grn_number, receipt_date
  - po_id, supplier_id
  - status, quality_check_status
  - received_by

goods_receipt_items:
  - id, grn_id, po_item_id
  - product_variant_id
  - ordered_qty, received_qty
  - batch_number, expiry_date
  - quality_status, notes
```

---

## Phase 5: Financial Modules

### 5.1 Chart of Accounts

**Account Structure:**
```
1000 - Assets
  1100 - Current Assets
    1110 - Cash & Bank
    1120 - Accounts Receivable
    1130 - Inventory
    1140 - Prepaid Expenses
  1200 - Fixed Assets
    1210 - Land & Buildings
    1220 - Plant & Machinery
    1230 - Vehicles
    1240 - Furniture & Fixtures
    1250 - Accumulated Depreciation

2000 - Liabilities
  2100 - Current Liabilities
    2110 - Accounts Payable
    2120 - Short-term Loans
    2130 - Taxes Payable
    2140 - Accrued Expenses
  2200 - Long-term Liabilities

3000 - Equity
  3100 - Capital
  3200 - Retained Earnings

4000 - Revenue
  4100 - Fuel Sales
  4200 - Lubricant Sales
  4300 - Cylinder Sales
  4400 - Other Income

5000 - Expenses
  5100 - Cost of Goods Sold
  5200 - Operating Expenses
  5300 - Administrative Expenses
  5400 - Depreciation
```

### 5.2 Double-Entry Accounting

**Automatic Journal Entries:**
- Sales: Debit Cash/Receivable, Credit Sales, Credit GST Payable
- Purchase: Debit Inventory/Expense, Debit GST Input, Credit Payable
- Receipt: Debit Bank, Credit Receivable
- Payment: Debit Payable, Credit Bank
- Salary: Debit Salary Expense, Credit Bank, Credit Statutory

### 5.3 Accounts Receivable (Debtors)

**Features:**
- Customer ledger
- Invoice tracking
- Receipt recording
- Aging analysis (0-30, 31-60, 61-90, 90+ days)
- Credit note handling
- Statement generation
- Collection follow-up
- Bad debt provisioning

### 5.4 Accounts Payable (Creditors)

**Features:**
- Supplier ledger
- Invoice entry & verification
- Three-way matching (PO-GRN-Invoice)
- Payment scheduling
- Debit note handling
- TDS deduction
- Payment approval workflow

### 5.5 Bank & Cash Management

**Features:**
- Multiple bank accounts
- Bank transactions (deposit, withdrawal, transfer)
- Cheque management
- Post-dated cheques
- Bank reconciliation
- Cash book
- Petty cash

### 5.6 Fixed Assets & Depreciation

**Depreciation Methods:**
- Straight Line
- Written Down Value (WDV)
- Sum of Years Digits

**Features:**
- Asset register
- Category-wise depreciation rates
- Automatic monthly depreciation
- Asset transfer between branches
- Asset disposal/sale
- Asset maintenance tracking

### 5.7 Fixed & Variable Costs

**Fixed Costs:**
- Rent
- Insurance
- License fees
- AMC charges
- Electricity (fixed component)

**Variable Costs:**
- Utilities (metered)
- Fuel & vehicle expenses
- Repairs & maintenance
- Consumables

### 5.8 Financial Reports

**Standard Reports:**
1. Trial Balance
2. Profit & Loss Statement
3. Balance Sheet
4. Cash Flow Statement
5. Day Book
6. Ledger Reports
7. GST Reports (GSTR-1, GSTR-3B)
8. TDS Reports

---

## Phase 6: HR & Payroll

### 6.1 Employee Management

**Database Tables:**
```sql
employees:
  - id, employee_code, name
  - department_id, designation_id
  - date_of_joining, date_of_birth
  - gender, phone, email, address
  - bank_account, pan, aadhar
  - pf_number, esi_number
  - salary_structure_id
  - reporting_manager_id
  - is_active

departments:
  - id, business_id, name, code

designations:
  - id, name, level
```

### 6.2 Attendance & Leave

**Features:**
- Daily attendance marking
- Multiple attendance types (Present, Absent, Half-day, Leave)
- Leave types (CL, SL, EL, etc.)
- Leave balance tracking
- Leave application & approval
- Overtime recording
- Shift-based attendance

### 6.3 Salary Processing

**Salary Components:**
- Basic Salary
- HRA (House Rent Allowance)
- DA (Dearness Allowance)
- Conveyance
- Special Allowance
- PF (Employee + Employer)
- ESI (Employee + Employer)
- TDS

**Special Feature - Transaction Adjustments:**
```sql
salary_adjustments:
  - id, employee_id, month, year
  - adjustment_type (shortage/penalty/incentive/recovery)
  - reference_type, reference_id
  - amount, description
  - status (pending/applied/cancelled)
```

**Example Flow:**
1. Pump operator has shortage of ₹500 in previous shift
2. System creates adjustment record linked to shift
3. During salary processing, adjustment is applied
4. Payslip shows detailed breakdown

---

## Phase 7: Dashboards & Analytics

### 7.1 Owner Dashboard

**Sections:**
- Business Selection Widget
- Consolidated Revenue (Both Businesses)
- Consolidated Receivables & Payables
- Cash Position
- Key Alerts & Notifications
- Quick Actions

### 7.2 ARS Corporation Dashboard

**Widgets:**
- Today's Sales (by fuel type)
- Tank Stock Levels (visual gauges)
- Shift Status (current operators)
- Daily Reconciliation Summary
- Process Loss vs Permissible
- Cylinder Status
- Top Credit Customers
- Collection Summary

### 7.3 ARS Lube Dashboard

**Widgets:**
- Today's Sales
- Order Pipeline
- Stock Alerts (Low/Expiring)
- Top Customers
- Receivables Aging
- Recent Dispatches
- Sales Team Performance

### 7.4 Financial Dashboard

**Widgets:**
- Revenue Trend
- Expense Breakdown
- Profit Margins
- Cash Flow
- Receivables vs Payables
- Bank Balances

---

## Phase 8: Reports & Exports

### 8.1 Pre-built Reports

**ARS Corporation:**
- Daily Sales Report (Pump-wise, Nozzle-wise)
- Shift Summary Report
- Tank Stock Report
- Dip vs Meter Reconciliation
- Process Loss Report
- Cylinder Stock & Movement Report
- Credit Customer Statement
- Collection Report

**ARS Lube:**
- Sales Order Report
- Invoice Register
- Dispatch Report
- Stock Report (Batch-wise)
- Expiry Alert Report
- Customer Ledger
- Sales Analysis (Product-wise, Customer-wise)

**Financial:**
- Trial Balance
- P&L Statement
- Balance Sheet
- Debtor Aging
- Creditor Aging
- Bank Book
- Cash Book

### 8.2 Export Formats
- PDF
- Excel
- CSV

---

## File Structure

```
ars-erp-dashboard/
├── prisma/
│   ├── schema.prisma          # Complete database schema
│   ├── seed.mjs               # Seed data
│   └── migrations/            # Database migrations
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.js
│   │   │   ├── Sidebar.js
│   │   │   ├── Header.js
│   │   │   └── Footer.js
│   │   ├── dashboard/
│   │   │   ├── petrol-pump/    # ARS Corp widgets
│   │   │   ├── lubricant/      # ARS Lube widgets
│   │   │   └── financial/      # Financial widgets
│   │   ├── ui/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Select.js
│   │   │   ├── Modal.js
│   │   │   ├── Table.js
│   │   │   ├── Card.js
│   │   │   └── ...
│   │   └── forms/
│   │       ├── petrol-pump/
│   │       ├── lubricant/
│   │       ├── financial/
│   │       └── hr/
│   ├── contexts/
│   │   ├── AppContext.js      # Global state
│   │   └── ThemeContext.js    # Theme management
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useDebounce.js
│   ├── lib/
│   │   ├── prisma.js          # Prisma client
│   │   ├── auth.js            # Auth utilities
│   │   ├── permissions.js     # Permission checks
│   │   └── utils.js           # Helper functions
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── businesses/
│   │   │   ├── petrol-pump/
│   │   │   │   ├── tanks/
│   │   │   │   ├── pumps/
│   │   │   │   ├── shifts/
│   │   │   │   ├── sales/
│   │   │   │   ├── cylinders/
│   │   │   │   └── losses/
│   │   │   ├── lubricant/
│   │   │   │   ├── products/
│   │   │   │   ├── inventory/
│   │   │   │   ├── orders/
│   │   │   │   ├── invoices/
│   │   │   │   └── purchases/
│   │   │   ├── financial/
│   │   │   │   ├── accounts/
│   │   │   │   ├── journal/
│   │   │   │   ├── banking/
│   │   │   │   ├── debtors/
│   │   │   │   ├── creditors/
│   │   │   │   └── reports/
│   │   │   └── hr/
│   │   │       ├── employees/
│   │   │       ├── attendance/
│   │   │       ├── leaves/
│   │   │       └── payroll/
│   │   ├── login.js
│   │   ├── select-business.js
│   │   ├── dashboard.js
│   │   ├── petrol-pump/
│   │   │   ├── index.js       # Dashboard
│   │   │   ├── tanks/
│   │   │   ├── pumps/
│   │   │   ├── shifts/
│   │   │   ├── sales/
│   │   │   ├── cylinders/
│   │   │   └── losses/
│   │   ├── lubricant/
│   │   │   ├── index.js       # Dashboard
│   │   │   ├── products/
│   │   │   ├── inventory/
│   │   │   ├── orders/
│   │   │   ├── invoices/
│   │   │   └── purchases/
│   │   ├── financial/
│   │   ├── hr/
│   │   └── reports/
│   └── styles/
│       └── globals.css
└── public/
    └── ...
```

---

## Implementation Order

### Week 1-2: Foundation
1. ✅ Setup complete Prisma schema
2. ✅ Database migrations
3. ✅ Enhanced authentication
4. ✅ Role & permission system
5. ✅ Base UI components
6. ✅ Layout redesign

### Week 3-4: Masters & Setup
1. Business & branch management
2. User management
3. Product categories & products
4. Customer & supplier masters
5. Fuel types & configurations

### Week 5-7: ARS Corporation Core
1. Tank management
2. Pump & nozzle management
3. Shift management
4. Fuel sales & transactions
5. Dip & meter reconciliation
6. Loss tracking

### Week 8-9: Cylinder Operations
1. Cylinder inventory
2. Customer deposits
3. Swap transactions
4. Supply chain management

### Week 10-12: ARS Lube Core
1. Product management with variants
2. Inventory with batches
3. Multi-tier pricing
4. Sales orders & invoicing
5. Dispatch & delivery
6. Purchase management

### Week 13-16: Financial Modules
1. Chart of accounts
2. Journal entries
3. Debtors management
4. Creditors management
5. Bank & cash management
6. Fixed assets & depreciation
7. Expense management

### Week 17-19: HR & Payroll
1. Employee management
2. Attendance tracking
3. Leave management
4. Salary structures
5. Payroll processing with adjustments
6. Payslip generation

### Week 20-22: Reports & Dashboards
1. All dashboards
2. Pre-built reports
3. Export functionality
4. Custom report builder (basic)

### Week 23-24: Testing & Polish
1. End-to-end testing
2. Performance optimization
3. Bug fixes
4. Documentation

---

## Next Steps

Starting with **Phase 1: Foundation** - I'll begin by:

1. Creating the complete Prisma schema
2. Setting up proper authentication with JWT
3. Implementing role-based access control
4. Creating reusable UI components
5. Building the enhanced layout with business-specific navigation

Shall I proceed with the implementation?
