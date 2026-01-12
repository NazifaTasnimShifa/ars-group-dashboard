// src/pages/inventory/index.js

import Link from 'next/link';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import { InboxStackIcon, ShoppingCartIcon, BanknotesIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

const inventoryPages = [
  {
    name: 'Inventory Status',
    description: 'View current stock levels, values, and product statuses.',
    href: '/inventory/status',
    icon: InboxStackIcon,
  },
  {
    name: 'Purchases',
    description: 'Track all purchase orders and supplier invoices.',
    href: '/inventory/purchases',
    icon: ShoppingCartIcon,
  },
  {
    name: 'Sales',
    description: 'View and manage all sales invoices and customer orders.',
    href: '/inventory/sales',
    icon: BanknotesIcon,
  },
  {
    name: 'Process Loss',
    description: 'Log and track non-sale inventory reductions.',
    href: '/inventory/process-loss',
    icon: ArchiveBoxXMarkIcon,
  },
]

export default function InventoryIndexPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Inventory Management"
        description="Select a module to manage products, sales, and purchases."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {inventoryPages.map((page) => (
          <Link href={page.href} key={page.name} legacyBehavior>
            <a className="group relative flex flex-col items-start rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow">
              <div>
                <span className="inline-flex rounded-lg bg-indigo-50 p-3 ring-4 ring-white">
                  <page.icon className="h-6 w-6 text-indigo-700" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-base font-semibold leading-6 text-gray-900">
                  <span className="absolute inset-0" />
                  {page.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">{page.description}</p>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}