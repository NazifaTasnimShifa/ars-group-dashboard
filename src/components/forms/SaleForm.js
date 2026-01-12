// src/components/forms/SaleForm.js

export default function SaleForm({ onSave, onCancel }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div className="space-y-4">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium leading-6 text-gray-900">Customer Name</label>
          <input type="text" id="customer" required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">Invoice Amount</label>
          <input type="number" id="amount" required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Cancel</button>
        <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Record Sale</button>
      </div>
    </form>
  );
}