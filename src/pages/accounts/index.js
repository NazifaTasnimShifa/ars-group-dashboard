// src/pages/accounts/index.js

import Link from 'next/link';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import { ArrowUpOnSquareIcon, ArrowDownOnSquareIcon } from '@heroicons/react/24/outline';

const accountPages = [
  {
    name: 'Sundry Debtors',
    description: 'Manage money owed to the company by customers.',
    href: '/accounts/debtors',
    icon: ArrowUpOnSquareIcon,
  },
  {
    name: 'Sundry Creditors',
    description: 'Manage money the company owes to suppliers.',
    href: '/accounts/creditors',
    icon: ArrowDownOnSquareIcon,
  },
]

export default function AccountsIndexPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Accounts Management"
        description="Manage receivables, payables, and the chart of accounts."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accountPages.map((page) => (
          <Link href={page.href} key={page.name} className="group relative flex flex-col items-start rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow">

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

          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
