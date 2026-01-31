// src/pages/accounts/chart-of-accounts.js
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import AccountForm from '@/components/forms/AccountForm';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';

const typeColors = {
  Asset: 'bg-blue-100 text-blue-800',
  Liability: 'bg-red-100 text-red-800',
  Equity: 'bg-purple-100 text-purple-800',
  Income: 'bg-green-100 text-green-800',
  Expense: 'bg-yellow-100 text-yellow-800',
};

export default function ChartOfAccountsPage() {
  const { currentBusiness } = useAppContext();
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({ open: false, mode: 'add', account: null });

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/chart-of-accounts?company_id=${currentBusiness.id}`);
        const data = await res.json();
        if (data.success) {
            setAccounts(Array.isArray(data.data) ? data.data : []);
        }
    } catch (error) {
        console.error("Failed to fetch accounts:", error);
    } finally {
        setIsLoading(false);
    }
  }, [currentBusiness]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    const method = isAdd ? 'POST' : 'PUT';
    
    // For integer IDs, we append ID to URL for updates, but don't send it in body for adds
    const url = isAdd 
      ? '/api/chart-of-accounts' 
      : `/api/chart-of-accounts/${modalState.account.id}`;
    
    const payload = { ...formData, company_id: currentBusiness.id };
    
    // API expects no ID in body for updates usually, but we must ensure we don't send it for creation if it's auto-increment
    if (isAdd) delete payload.id;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            setModalState({ ...modalState, open: false });
            fetchData();
        } else {
            alert('Failed to save account');
        }
    } catch (e) { console.error(e); alert('Error saving account'); }
  };

  const handleRemove = async (account) => {
    if(!confirm(`Delete account ${account.name}?`)) return;
    try {
        const res = await fetch(`/api/chart-of-accounts/${account.id}`, { method: 'DELETE' });
        if(res.ok) fetchData();
        else alert('Failed to delete');
    } catch (e) { console.error(e); }
  };

  const handleAdd = () => setModalState({ open: true, mode: 'add', account: null });
  const handleEdit = (account) => setModalState({ open: true, mode: 'edit', account });
  const handleCancel = () => setModalState({ ...modalState, open: false });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Account`}>
        <AccountForm account={modalState.account} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader
        title="Chart of Accounts"
        description="The master list of all financial accounts used to categorize transactions."
      >
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Account
        </button>
      </PageHeader>

      <div className="rounded-lg bg-white shadow">
        <div className="flow-root">
            <div className="inline-block min-w-full align-middle">
              {isLoading ? <p className="text-center py-4 text-gray-500">Loading...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Code</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Account Name</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Balance</th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {accounts.map((account) => (
                            <tr key={account.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-gray-500 sm:pl-6">{account.code}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{account.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${typeColors[account.type]}`}>
                                        {account.type}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-800 text-right font-medium">{formatCurrency(account.balance)}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                    <button onClick={() => handleEdit(account)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                                    <button onClick={() => handleRemove(account)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              )}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
