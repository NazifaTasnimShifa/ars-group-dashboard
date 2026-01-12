// src/components/ui/PageHeader.js

export default function PageHeader({ title, description, children }) {
  return (
    <div className="border-b border-gray-200 pb-5 mb-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {children}
        </div>
      </div>
    </div>
  );
}