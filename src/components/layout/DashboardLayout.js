// src/components/layout/DashboardLayout.js

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  FolderIcon,
  InboxIcon,
  UsersIcon,
  TruckIcon,
  ChevronDoubleLeftIcon,
  ArrowRightStartOnRectangleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAppContext } from '@/contexts/AppContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Financial Reports',
    href: '/reports',
    icon: FolderIcon,
    children: [
      { name: 'Balance Sheet', href: '/reports/balance-sheet' },
      { name: 'Income Statement', href: '/reports/income-statement' },
      { name: 'Cash Flow', href: '/reports/cash-flow' },
      { name: 'Trial Balance', href: '/reports/trial-balance' },
    ],
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: InboxIcon,
    children: [
      { name: 'Inventory Status', href: '/inventory/status' },
      { name: 'Purchases', href: '/inventory/purchases' },
      { name: 'Sales', href: '/inventory/sales' },
      { name: 'Process Loss', href: '/inventory/process-loss' },
    ],
  },
  {
    name: 'Accounts',
    href: '/accounts',
    icon: UsersIcon,
    children: [
      { name: 'Sundry Debtors', href: '/accounts/debtors' },
      { name: 'Sundry Creditors', href: '/accounts/creditors' },
      { name: 'Chart of Accounts', href: '/accounts/chart-of-accounts' },
    ],
  },
  { name: 'Fixed Assets', href: '/fixed-assets', icon: TruckIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { selectedCompany, switchCompany, logout, user } = useAppContext();
  const router = useRouter();

  // If no company selected yet, don't show layout (ProtectedRoute usually handles this)
  if (!selectedCompany) {
    return null; 
  }

  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <h1
          className={classNames(
            isCollapsed && 'lg:hidden',
            'text-xl font-bold text-white transition-opacity duration-200'
          )}
        >
          {selectedCompany.shortName}
        </h1>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {!item.children ? (
                    <Link href={item.href} legacyBehavior>
                      <a
                        className={classNames(
                          router.pathname === item.href
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        <span className={classNames(isCollapsed && 'lg:hidden')}>
                          {item.name}
                        </span>
                      </a>
                    </Link>
                  ) : (
                    <Disclosure as="div" defaultOpen={item.children.some(child => router.pathname.startsWith(child.href))}>
                      {({ open }) => (
                        <>
                          <Disclosure.Button
                            className={classNames(
                              item.children.some((child) => router.pathname.startsWith(child.href))
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800',
                              'group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm leading-6 font-semibold'
                            )}
                          >
                            <item.icon className="h-6 w-6 shrink-0" />
                            <span className={classNames(isCollapsed && 'lg:hidden', 'flex-1')}>
                              {item.name}
                            </span>
                            <ChevronRightIcon
                              className={classNames(
                                open ? 'rotate-90 text-gray-50' : 'text-gray-400',
                                isCollapsed && 'lg:hidden',
                                'h-5 w-5 shrink-0 transition-transform duration-200'
                              )}
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel as="ul" className={classNames(isCollapsed && 'lg:hidden', 'mt-1 px-2')}>
                            {item.children.map((subItem) => (
                              <li key={subItem.name}>
                                <Link href={subItem.href} legacyBehavior>
                                  <a
                                    className={classNames(
                                      router.pathname === subItem.href
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-400 hover:bg-gray-800',
                                      'block rounded-md py-2 pr-2 pl-9 text-sm leading-6'
                                    )}
                                  >
                                    {subItem.name}
                                  </a>
                                </Link>
                              </li>
                            ))}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  )}
                </li>
              ))}
            </ul>
          </li>

          <li className="-mx-6 mt-auto">
            <div
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer border-t border-gray-800"
            >
              <ChevronDoubleLeftIcon
                className={classNames(
                  isCollapsed ? 'rotate-180' : 'rotate-0',
                  'h-6 w-6 shrink-0 transition-transform duration-300'
                )}
              />
              <span className={classNames(isCollapsed ? 'hidden' : 'block')}>
                Collapse
              </span>
            </div>
            
            {/* Only Show Switch Company for Admins */}
            {user?.role === 'admin' && (
              <button
                onClick={switchCompany}
                className="w-full flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <ArrowPathIcon className="h-6 w-6 shrink-0" />
                <span className={classNames(isCollapsed && 'lg:hidden')}>
                  Switch Company
                </span>
              </button>
            )}

            <button
              onClick={logout}
              className="w-full flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white bg-red-900 hover:bg-red-800"
            >
              <ArrowRightStartOnRectangleIcon className="h-6 w-6 shrink-0" />
              <span className={classNames(isCollapsed && 'lg:hidden')}>
                Sign out
              </span>
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
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  {sidebarContent}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Desktop sidebar */}
        <div className={classNames(isCollapsed ? 'lg:w-20' : 'lg:w-72', 'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300')}>
          {sidebarContent}
        </div>

        {/* Main content */}
        <div className={classNames(isCollapsed ? 'lg:pl-20' : 'lg:pl-72', 'transition-all duration-300')}>
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-1 text-lg font-semibold leading-6 text-gray-900">
              {selectedCompany.name}
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
                <span className="text-sm font-semibold leading-6 text-gray-900">
                    {user?.name} ({user?.role})
                </span>
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