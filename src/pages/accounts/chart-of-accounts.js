// src/pages/accounts/chart-of-accounts.js

import { useAppContext } from '@/contexts/AppContext';
import { chartOfAccountsData } from '@/data/mockData';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import { PlusIcon } from '@heroicons/react/20/solid';

const typeColors = {
  Asset: 'bg-blue-100 text-blue-800',
  Liability: 'bg-red-100 text-red-800',
  Equity: 'bg-purple-100 text-purple-800',
  Income: 'bg-green-100 text-green-800',
  Expense: 'bg-yellow-100 text-yellow-800',
};

export default function ChartOfAccountsPage() {
  const { selectedCompany } = useAppContext();
  const accounts = selectedCompany ? chartOfAccountsData[selectedCompany.id] : [];
  const formatCurrency = (value) => `৳${value.toLocaleString('en-IN')}`;

  return (
    <DashboardLayout>
      <PageHeader
        title="Chart of Accounts"
        description="The master list of all financial accounts used to categorize transactions."
      >
        <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Account
        </button>
      </PageHeader>

      <div className="rounded-lg bg-white shadow">
        <div className="flow-root">
            <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Account Code</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Account Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {accounts.map((account) => (
                            <tr key={account.code}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-gray-500 sm:pl-6">{account.code}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{account.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${typeColors[account.type]}`}>
                                        {account.type}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-800 text-right font-medium">{formatCurrency(account.balance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}