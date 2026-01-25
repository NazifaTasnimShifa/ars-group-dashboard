// src/pages/accounts/chart-of-accounts.js

import { useAppContext } from '@/contexts/AppContext';
import { chartOfAccountsData } from '@/data/mockData';
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from '@/components/ui/PageHeader';
import { PlusIcon } from '@heroicons/react/20/solid';

// A recursive component to render the nested account structure
const AccountRow = ({ account, level }) => {
    const indentClass = {
        0: 'pl-0',
        1: 'pl-6',
        2: 'pl-12',
        3: 'pl-18',
    };

    return (
        <>
            <div className={`flex justify-between items-center py-3 border-b ${level === 0 ? 'bg-gray-50' : ''}`}>
                <p className={`text-sm font-medium text-gray-900 ${indentClass[level]}`}>
                    <span className="font-mono text-gray-500 mr-4">{account.id}</span>
                    {account.name}
                </p>
            </div>
            {account.children && account.children.map(child => (
                <AccountRow key={child.id} account={child} level={level + 1} />
            ))}
        </>
    );
};

export default function ChartOfAccountsPage() {
  const { selectedCompany } = useAppContext();
  const accounts = selectedCompany ? chartOfAccountsData[selectedCompany.id] : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Chart of Accounts"
        description="The complete list of financial accounts used to categorize transactions."
      >
        <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Account
        </button>
      </PageHeader>

      <div className="rounded-lg bg-white shadow">
        <div className="flow-root">
            <div className="inline-block min-w-full align-middle">
                <div className="p-4">
                    {accounts.map(account => (
                        <AccountRow key={account.id} account={account} level={0} />
                    ))}
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}