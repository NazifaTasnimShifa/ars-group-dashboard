// src/components/forms/PurchaseOrderForm.js

export default function PurchaseOrderForm({ purchase, onSave, onCancel }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium leading-6 text-gray-900">Supplier Name</label>
            <input type="text" name="supplier" id="supplier" defaultValue={purchase?.supplier || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Beximco LPG Unit" />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-900">Purchase Date</label>
            <input type="date" name="date" id="date" defaultValue={purchase?.date || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" />
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium leading-6 text-gray-900">Items</legend>
          <div className="mt-2 space-y-2">
            {/* In a real app, this would be a dynamic list. For the prototype, we'll use a static example. */}
            <div className="grid grid-cols-12 gap-2">
              <input type="text" className="col-span-6 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" placeholder="Item Name" />
              <input type="number" className="col-span-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" placeholder="Qty" />
              <input type="number" className="col-span-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" placeholder="Price" />
              <input type="text" readOnly className="col-span-2 block w-full rounded-md border-0 bg-gray-100 py-1.5 text-gray-500 ring-1 ring-inset ring-gray-300" placeholder="Total" />
            </div>
          </div>
        </fieldset>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium leading-6 text-gray-900">Total Amount</label>
          <input type="number" name="amount" id="amount" defaultValue={purchase?.amount || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., 1100000" />
        </div>

      </div>
      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          Save Purchase Order
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}