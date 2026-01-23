// src/components/forms/InventoryItemForm.js

export default function InventoryItemForm({ item, onSave, onCancel }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div className="space-y-4">
        {/* Item Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Item Name</label>
          <input type="text" name="name" id="name" defaultValue={item?.name || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Petrol (Octane 95)" />
        </div>

        {/* SKU and Category */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label htmlFor="sku" className="block text-sm font-medium leading-6 text-gray-900">SKU</label>
                <input type="text" name="sku" id="sku" defaultValue={item?.sku || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., ARS-FUL-001"/>
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900">Category</label>
                <input type="text" name="category" id="category" defaultValue={item?.category || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Fuel"/>
            </div>
        </div>

        {/* Stock and Unit */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="stock" className="block text-sm font-medium leading-6 text-gray-900">Stock Quantity</label>
            <input type="number" name="stock" id="stock" defaultValue={item?.stock || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., 15000" />
          </div>
          <div>
            <label htmlFor="unit" className="block text-sm font-medium leading-6 text-gray-900">Unit</label>
            <input type="text" name="unit" id="unit" defaultValue={item?.unit || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Litre" />
          </div>
        </div>
      </div>
      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          Save Item
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}