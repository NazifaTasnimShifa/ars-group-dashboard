// src/pages/inventory/process-loss.js

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';

const ProcessLossForm = ({ loss, onSave, onCancel }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.quantity = parseFloat(data.quantity);
        
        if (loss?.id) {
            data.id = loss.id;
            // Keep existing date if editing, or use current if not present
            data.date = loss.date ? new Date(loss.date).toISOString() : new Date().toISOString();
        } else {
            data.id = `PL-${Date.now().toString().slice(-6)}`;
            data.date = new Date().toISOString();
        }
        data.unit = 'Unit'; // Default unit
        
        onSave(data);
    };

    return (
    <form onSubmit={handleSubmit}>
        <div className="space-y-4">
            <div>
                <label htmlFor="product" className="block text-sm font-medium">Product Name</label>
                <input type="text" name="product" id="product" defaultValue={loss?.product || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium">Quantity Lost</label>
                    <input type="number" name="quantity" id="quantity" defaultValue={loss?.quantity || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium">Loss Type</label>
                    <select name="type" id="type" defaultValue={loss?.type || 'Vaporization'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="Vaporization">Vaporization</option>
                        <option value="Spillage">Spillage</option>
                        <option value="Damage">Damage</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
                <textarea name="notes" id="notes" rows={3} defaultValue={loss?.notes || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
        </div>
         <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{loss ? 'Update' : 'Record'} Loss</button>
        </div>
    </form>
    );
};

export default function ProcessLossPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', loss: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();

  const [losses, setLosses] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/data?type=process-loss&companyId=${selectedCompany.id}`);
        const data = await res.json();
        setLosses(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to fetch process loss:", error);
    } finally {
        setIsLoading(false);
    }
  }, [selectedCompany]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    const method = modalState.mode === 'edit' ? 'PUT' : 'POST';
    try {
        const res = await fetch(`/api/data?type=process-loss&companyId=${selectedCompany.id}`, {
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

  const handleRemove = async (loss) => {
    if(!confirm(`Remove loss record ${loss.id}?`)) return;
    try {
        const res = await fetch(`/api/data?type=process-loss&companyId=${selectedCompany.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: loss.id })
        });
        if(res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const filteredLosses = useMemo(() => {
    if (!searchQuery) return losses;
    return losses.filter(loss => 
      loss.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loss.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [losses, searchQuery]);

  useEffect(() => {
    const totalLossQty = losses.reduce((sum, item) => sum + Number(item.quantity), 0);
    setStats([
        { name: 'Total Loss Events', stat: losses.length },
        { name: 'Total Quantity Lost', stat: `${totalLossQty.toFixed(2)} Units` },
        { name: 'Most Common Type', stat: 'Vaporization' },
    ]);
  }, [losses]);

  const handleAdd = () => setModalState({ open: true, mode: 'add', loss: null });
  const handleEdit = (loss) => setModalState({ open: true, mode: 'edit', loss });
  const handleCancel = () => setModalState({ ...modalState, open: false });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Record' : 'Edit'} Process Loss`}>
        <ProcessLossForm loss={modalState.loss} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Process & System Loss" description="Log and track non-sale reductions in inventory like vaporization or spillage.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Record Loss
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => ( <PageStat key={item.name} item={item} /> ))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="sm:flex sm:items-center sm:justify-between mb-4">
            <div className="w-full max-w-xs">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input id="search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Filter by product or type..." type="search" />
              </div>
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
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Event ID</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Notes</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredLosses.map((loss) => (
                      <tr key={loss.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{loss.id}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(loss.date).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{loss.product}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{loss.type}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600 font-semibold">{loss.quantity} {loss.unit}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{loss.notes}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => handleEdit(loss)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(loss)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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