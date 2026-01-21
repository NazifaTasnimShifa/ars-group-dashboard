// src/components/layout/DashboardLayout.js

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  ChartPieIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ArrowRightStartOnRectangleIcon, // NEW: Sign out icon
  ArrowPathIcon,                  // NEW: Switch company icon
} from '@heroicons/react/24/outline';
import { useAppContext } from '@/contexts/AppContext';

const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  { name: 'Debtors / Creditors', href: '#', icon: UsersIcon, current: false },
  { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedCompany, switchCompany, logout } = useAppContext();

  if (!selectedCompany) {
    return <div>Loading company...</div>;
  }

  // NEW: We define the sidebar content once and reuse it for both mobile and desktop
  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className={classNames(
            isCollapsed && 'lg:hidden', // Hide on desktop when collapsed
            "text-2xl font-bold text-white transition-opacity duration-200"
        )}>{selectedCompany.shortName}</h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    <span className={classNames(isCollapsed && 'lg:hidden')}>{item.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </li>
          <li className="-mx-6 mt-auto">
            <div
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer"
            >
                <ChevronDoubleLeftIcon className={classNames(isCollapsed ? 'rotate-180' : 'rotate-0', 'h-6 w-6 shrink-0 transition-transform duration-300')} />
                <span className={classNames(isCollapsed ? 'hidden' : 'block')}>Collapse</span>
            </div>
             <button
                onClick={switchCompany}
                className="w-full flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
             >
                <ArrowPathIcon className="h-6 w-6 shrink-0" />
                <span className={classNames(isCollapsed && 'lg:hidden')}>Switch Company</span>
             </button>
            <button
                onClick={logout}
                className="w-full flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white bg-red-600 hover:bg-red-500"
             >
                <ArrowRightStartOnRectangleIcon className="h-6 w-6 shrink-0" />
                <span className={classNames(isCollapsed && 'lg:hidden')}>Sign out</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );


  return (
    <>
      <div>
        {/* Mobile sidebar */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                  {/* NEW: Re-using the sidebar content here */}
                  {sidebarContent}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className={classNames(
            isCollapsed ? 'lg:w-20' : 'lg:w-72',
            'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300'
        )}>
          {/* NEW: Re-using the sidebar content here */}
          {sidebarContent}
        </div>

        {/* Main content area */}
        <div className={classNames(
            isCollapsed ? 'lg:pl-20' : 'lg:pl-72',
            'transition-all duration-300'
        )}>
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex-1 text-lg font-semibold leading-6 text-gray-900">
              {selectedCompany.name}
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}