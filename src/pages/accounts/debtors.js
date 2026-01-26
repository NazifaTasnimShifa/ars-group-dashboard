import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import DebtorForm from '@/components/forms/DebtorForm';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PencilIcon, TrashIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/20/solid';

export default function DebtorsPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', debtor: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();

  const [debtors, setDebtors] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/data?type=debtors&companyId=${selectedCompany.id}`);
        const data = await res.json();
        setDebtors(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to fetch:", error);
    } finally {
        setIsLoading(false);
    }
  }, [selectedCompany]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredDebtors = useMemo(() => {
    if (!searchQuery) return debtors;
    return debtors.filter(debtor => 
      debtor.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [debtors, searchQuery]);

  useEffect(() => {
    const totalReceivables = debtors.reduce((sum, d) => sum + Number(d.amount), 0);
    const overdueDebtors = debtors.filter(d => d.aging > 30).length;

    setStats([
      { name: 'Total Outstanding', stat: formatCurrency(totalReceivables) },
      { name: 'Overdue (>30 Days)', stat: overdueDebtors },
      { name: 'Avg. Collection Period', stat: '45 Days' },
    ]);
  }, [debtors]);

  const handleRemove = async (debtor) => {
    if(!confirm(`Are you sure you want to delete ${debtor.name}?`)) return;
    try {
        const res = await fetch(`/api/data?type=debtors&companyId=${selectedCompany.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: debtor.id })
        });
        if(res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSave = async (formData) => {
    const method = modalState.mode === 'edit' ? 'PUT' : 'POST';
    try {
        const res = await fetch(`/api/data?type=debtors&companyId=${selectedCompany.id}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if(res.ok) {
            setModalState({ ...modalState, open: false });
            fetchData(); 
        } else {
            alert('Failed to save debtor');
        }
    } catch (e) { console.error(e); }
  };

  const handleAdd = () => setModalState({ open: true, mode: 'add', debtor: null });
  const handleEdit = (debtor) => setModalState({ open: true, mode: 'edit', debtor });
  const handleCancel = () => setModalState({ ...modalState, open: false });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Debtor`}>
        <DebtorForm debtor={modalState.debtor} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Sundry Debtors" description="Manage all parties who owe money to the company.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
           <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Debtor
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
              {isLoading ? <p className="text-center py-4 text-gray-500">Loading data...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Debtor Name</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Due Date</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aging</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredDebtors.map((debtor) => (
                      <tr key={debtor.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{debtor.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(debtor.amount)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(debtor.due).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{debtor.aging} days</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => handleEdit(debtor)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(debtor)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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