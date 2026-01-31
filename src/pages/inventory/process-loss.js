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
        if (loss?.id) data.id = loss.id; // Maintain ID on edit
        onSave(data);
    };

    return (
    <form onSubmit={handleSubmit}>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Product Name</label>
                <input type="text" name="product" defaultValue={loss?.product || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Quantity Lost</label>
                    <input type="number" name="quantity" defaultValue={loss?.quantity || ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Loss Type</label>
                    <select name="type" defaultValue={loss?.type || 'Vaporization'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option value="Vaporization">Vaporization</option>
                        <option value="Spillage">Spillage</option>
                        <option value="Damage">Damage</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Notes</label>
                <textarea name="notes" rows={3} defaultValue={loss?.notes || ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
        </div>
         <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">{loss ? 'Update' : 'Record'}</button>
        </div>
    </form>
    );
};

export default function ProcessLossPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', loss: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { currentBusiness } = useAppContext();
  const [losses, setLosses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
        // Correct API Endpoint
        const res = await authFetch(`/api/process-loss?company_id=${currentBusiness.id}`);
        const data = await res.json();
        if(data.success) setLosses(data.data);
    } catch (error) { console.error("Failed to fetch:", error); } 
    finally { setIsLoading(false); }
  }, [currentBusiness]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    const id = isAdd ? `PL-${Date.now()}` : modalState.loss.id;
    const payload = { ...formData, company_id: currentBusiness.id, id, date: isAdd ? new Date().toISOString() : modalState.loss.date };
    const method = isAdd ? 'POST' : 'PUT';
    const url = isAdd ? '/api/process-loss' : `/api/process-loss/${id}`;

    try {
        const res = await authFetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            setModalState({ ...modalState, open: false });
            fetchData();
        } else { alert('Failed to save'); }
    } catch (e) { console.error(e); }
  };

  const handleRemove = async (loss) => {
    if(!confirm(`Remove record ${loss.id}?`)) return;
    try {
        const res = await authFetch(`/api/process-loss/${loss.id}`, { method: 'DELETE' });
        if(res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  // ... (Rest of UI similar to before, filteredLosses logic etc.)
  // Minimal UI render for brevity, ensure Table matches previous logic
  
  const filteredLosses = useMemo(() => {
    if (!searchQuery) return losses;
    return losses.filter(loss => loss.product.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [losses, searchQuery]);

  const handleAdd = () => setModalState({ open: true, mode: 'add', loss: null });
  const handleEdit = (loss) => setModalState({ open: true, mode: 'edit', loss });

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({...modalState, open: val})} title={`${modalState.mode === 'add' ? 'Record' : 'Edit'} Process Loss`}>
        <ProcessLossForm loss={modalState.loss} onSave={handleSave} onCancel={() => setModalState({...modalState, open: false})} />
      </Modal>
      <PageHeader title="Process & System Loss" description="Log inventory reductions.">
        <button onClick={handleAdd} className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Record Loss</button>
      </PageHeader>
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 w-full max-w-xs relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Search..." type="search" />
        </div>
        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Product</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Qty</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLosses.map((loss) => (
                    <tr key={loss.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{loss.product}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{loss.type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600">{loss.quantity}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button onClick={() => handleEdit(loss)} className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5" /></button>
                        <button onClick={() => handleRemove(loss)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

