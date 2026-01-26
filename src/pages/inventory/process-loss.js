// src/pages/inventory/process-loss.js

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';
import PageStat from '@/components/ui/PageStat';
import FilterButtons from '@/components/ui/FilterButtons';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';

const ProcessLossForm = ({ onSave, onCancel }) => (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
        <div className="space-y-4">
            <div>
                <label htmlFor="product" className="block text-sm font-medium">Product Name</label>
                <input type="text" id="product" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium">Quantity Lost</label>
                    <input type="number" id="quantity" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div>
                    <label htmlFor="type" className="block text-sm font-medium">Loss Type</label>
                    <select id="type" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        <option>Vaporization</option>
                        <option>Spillage</option>
                        <option>Damage</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium">Notes</label>
                <textarea id="notes" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
        </div>
         <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Record Loss</button>
        </div>
    </form>
);

export default function ProcessLossPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedCompany } = useAppContext();

  const [losses, setLosses] = useState([]);
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (selectedCompany) {
      setIsLoading(true);
      fetch(`/api/data?type=process-loss&companyId=${selectedCompany.id}`)
        .then(res => res.json())
        .then(data => {
          setLosses(Array.isArray(data) ? data : []);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Failed to fetch process loss:", error);
          setLosses([]);
          setIsLoading(false);
        });
    }
  }, [selectedCompany]);

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
        { name: 'Total Quantity Lost', stat: `${totalLossQty.toFixed(2)} Units` }, // Simplified unit
        { name: 'Most Common Type', stat: 'Vaporization' }, // Mock calc
    ]);
  }, [losses]);

  return (
    <DashboardLayout>
      <Modal open={modalOpen} setOpen={setModalOpen} title="Record New Process Loss">
        <ProcessLossForm onSave={() => setModalOpen(false)} onCancel={() => setModalOpen(false)} />
      </Modal>

      <PageHeader title="Process & System Loss" description="Log and track non-sale reductions in inventory like vaporization or spillage.">
        <button onClick={() => setModalOpen(true)} type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
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