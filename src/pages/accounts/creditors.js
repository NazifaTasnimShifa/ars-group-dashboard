import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import CreditorForm from '@/components/forms/CreditorForm';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

export default function CreditorsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', creditor: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();

  const [creditors, setCreditors] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/data?type=creditors&companyId=${selectedCompany.id}`);
        const data = await res.json();
        setCreditors(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to fetch creditors:", error);
    } finally {
        setIsLoading(false);
    }
  }, [selectedCompany]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredCreditors = useMemo(() => {
    if (!searchQuery) return creditors;
    return creditors.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [creditors, searchQuery]);

  useEffect(() => {
    const totalPayables = creditors.reduce((sum, c) => sum + Number(c.amount), 0);
    const dueSoon = creditors.filter(c => c.aging < 30 && c.aging >= 0).length;
    setStats([
      { name: 'Total Payables', stat: formatCurrency(totalPayables) },
      { name: 'Due within 30 Days', stat: dueSoon },
      { name: 'Avg. Payment Period', stat: '28 Days' },
    ]);
  }, [creditors]);

  const handleRemove = async (creditor) => {
    if(!confirm(`Delete ${creditor.name}?`)) return;
    try {
        const res = await fetch(`/api/data?type=creditors&companyId=${selectedCompany.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: creditor.id })
        });
        if(res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSave = async (formData) => {
    const method = modalState.mode === 'edit' ? 'PUT' : 'POST';
    try {
        const res = await fetch(`/api/data?type=creditors&companyId=${selectedCompany.id}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if(res.ok) {
            setModalState({ ...modalState, open: false });
            fetchData();
        }
    } catch (e) { console.error(e); }
  };

  const handleAdd = () => setModalState({ open: true, mode: 'add', creditor: null });
  const handleEdit = (creditor) => setModalState({ open: true, mode: 'edit', creditor });
  const handleCancel = () => setModalState({ ...modalState, open: false });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Creditor`}>
        <CreditorForm creditor={modalState.creditor} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Sundry Creditors" description="A list of all parties the company owes money to.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Creditor
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 xl:flex xl:items-center xl:justify-between">
            <div className="w-full max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <input id="search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Filter by name..." type="search" />
            </div>
            <div className="mt-4 sm:mt-0">
                <FilterButtons periods={['1M', '3M', '6M', '1Y']} />
            </div>
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? <p className="text-center py-4 text-gray-500">Loading...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount Due</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredCreditors.map((creditor) => (
                      <tr key={creditor.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{creditor.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(creditor.amount)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(creditor.due).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => handleEdit(creditor)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(creditor)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}