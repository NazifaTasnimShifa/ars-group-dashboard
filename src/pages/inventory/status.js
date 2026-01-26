// src/pages/inventory/status.js

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import InventoryItemForm from '@/components/forms/InventoryItemForm';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const StatusBadge = ({ status }) => {
  const statusColors = {
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default function InventoryStatusPage() {
  const [modalState, setModalState] = useState({ open: false, mode: 'add', item: null });
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();

  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatCurrency = (value) => `৳${Number(value).toLocaleString('en-IN')}`;

  const fetchData = useCallback(async () => {
    if (!selectedCompany) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/data?type=inventory&companyId=${selectedCompany.id}`);
        const data = await res.json();
        setInventory(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
    } finally {
        setIsLoading(false);
    }
  }, [selectedCompany]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRemove = async (item) => {
    if(!confirm(`Remove ${item.name}?`)) return;
    try {
        const res = await fetch(`/api/data?type=inventory&companyId=${selectedCompany.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id })
        });
        if(res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const handleSave = async (formData) => {
    const method = modalState.mode === 'edit' ? 'PUT' : 'POST';
    try {
        const res = await fetch(`/api/data?type=inventory&companyId=${selectedCompany.id}`, {
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

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    return inventory.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory, searchQuery]);

  useEffect(() => {
    const totalStockValue = inventory.reduce(
        (sum, item) => sum + (Number(item.stock) * Number(item.costPrice)),
        0
    );
    const lowStockItems = inventory.filter((item) => item.status === 'Low Stock').length;

    setStats([
        { name: 'Total Inventory Value', stat: formatCurrency(totalStockValue) },
        { name: 'Items with Low Stock', stat: lowStockItems },
        { name: 'Total SKUs', stat: inventory.length },
    ]);
  }, [inventory]);

  const handleAdd = () => setModalState({ open: true, mode: 'add', item: null });
  const handleEdit = (item) => setModalState({ open: true, mode: 'edit', item });
  const handleCancel = () => setModalState({ ...modalState, open: false });

  return (
    <DashboardLayout>
      <Modal
        open={modalState.open}
        setOpen={(val) => setModalState({ ...modalState, open: val })}
        title={`${modalState.mode === 'add' ? 'Add' : 'Edit'} Inventory Item`}
      >
        <InventoryItemForm item={modalState.item} onSave={handleSave} onCancel={handleCancel} />
      </Modal>

      <PageHeader title="Inventory Status" description="A complete list of all products and their current stock levels.">
        <button onClick={handleAdd} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 inline" /> Add Item
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
              <input id="search" name="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Filter by name or SKU..." type="search" />
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
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock Value</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredInventory.map((item) => (
                      <tr key={item.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{item.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.sku}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.category}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{Number(item.stock).toLocaleString('en-IN')} {item.unit}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatCurrency(Number(item.stock) * Number(item.costPrice))}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><StatusBadge status={item.status} /></td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => handleEdit(item)} className="text-indigo-600 hover:text-indigo-900"><PencilIcon className="h-5 w-5" /></button>
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