// src/components/forms/FixedAssetForm.js

export default function FixedAssetForm({ asset, onSave, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    data.cost = parseFloat(data.cost);
    data.depreciation = 0; // New asset default
    data.bookValue = data.cost; // Initially cost = book value

    if (asset?.id) {
        data.id = asset.id;
    } else {
        data.id = `FA-${Date.now().toString().slice(-6)}`;
    }

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Asset Name</label>
          <input type="text" name="name" id="name" defaultValue={asset?.name || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., Delivery Truck" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label htmlFor="acquisitionDate" className="block text-sm font-medium leading-6 text-gray-900">Acquisition Date</label>
                <input type="date" name="acquisitionDate" id="acquisitionDate" defaultValue={asset?.acquisitionDate ? new Date(asset.acquisitionDate).toISOString().split('T')[0] : ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"/>
            </div>
            <div>
                <label htmlFor="cost" className="block text-sm font-medium leading-6 text-gray-900">Acquisition Cost</label>
                <input type="number" name="cost" id="cost" defaultValue={asset?.cost || ''} required className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600" placeholder="e.g., 3500000"/>
            </div>
        </div>
      </div>
      <div className="mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button type="submit" className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:col-start-2">
          {asset ? 'Update' : 'Save'} Asset
        </button>
        <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}