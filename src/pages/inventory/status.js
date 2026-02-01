// src/pages/inventory/status.js
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import InventoryItemForm from '@/components/forms/InventoryItemForm';
import PageStat from '@/components/ui/PageStat';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const StatusBadge = ({ status }) => {
  const statusColors = {
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>{status}</span>;
};

export default function InventoryStatusPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', item: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { currentBusiness, token, authFetch } = useAppContext();
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!currentBusiness) return;
    setIsLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await authFetch(`/api/inventory?company_id=${currentBusiness.id}`, { headers });
      const data = await res.json();
      if (data.success) setInventory(data.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [currentBusiness, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    return inventory.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [inventory, searchQuery]);

  const totalValue = inventory.reduce((sum, i) => sum + (Number(i.stock) * Number(i.costPrice)), 0);
  const stats = [{ name: 'Total Inventory Value', stat: formatCurrency(totalValue) }, { name: 'Total SKUs', stat: inventory.length }];

  const handleSave = async (formData) => {
    const isAdd = modalState.mode === 'add';
    const method = isAdd ? 'POST' : 'PUT';
    // For Add, we let backend or a utility generate ID if needed, or generate here.
    // Schema uses String ID.
    const id = isAdd ? `ITM-${Date.now()}` : modalState.item.id;

    const payload = {
      ...formData,
      company_id: currentBusiness.id,
      id: id
    };

    const url = isAdd ? '/api/inventory' : `/api/inventory/${id}`;

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const res = await authFetch(url, { method, headers, body: JSON.stringify(payload) });
      if (res.ok) {
        setModalState({ open: false, mode: 'add', item: null });
        fetchData();
      } else { alert('Failed to save'); }
    } catch (e) { console.error(e); alert('Error saving'); }
  };

  const handleRemove = async (item) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await authFetch(`/api/inventory/${item.id}`, { method: 'DELETE', headers });
      if (res.ok) fetchData();
      else alert('Failed to delete');
    } catch (e) { console.error(e); }
  };

  return (
    <DashboardLayout>
      <Modal open={modalState.open} setOpen={(val) => setModalState({ ...modalState, open: val })} title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Item`}>
        <InventoryItemForm item={modalState.item} onSave={handleSave} onCancel={() => setModalState({ ...modalState, open: false })} />
      </Modal>

      <PageHeader title="Inventory Status" description="Track stock levels.">
        <button onClick={() => setModalState({ open: true, mode: 'add', item: null })} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Item
        </button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((item) => (<PageStat key={item.name} item={item} />))}
      </dl>

      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 w-full max-w-xs relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" /></div>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm" placeholder="Search..." type="search" />
        </div>

        <div className="flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? <p>Loading...</p> : (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredInventory.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.sku}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.stock} {item.unit}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusBadge status={item.status} /></td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => setModalState({ open: true, mode: 'edit', item })} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
                          <button onClick={() => handleRemove(item)} className="ml-4 text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5" /></button>
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

