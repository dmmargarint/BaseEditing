import { Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Link, NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Base Editing Dashboard', href: '/'},
  // { name: 'Q&A', href: '/qa'},
  { name: 'About', href: '/about'},
  // { name: 'Contact', href: '/contact'},
];

export default function TopNavBar() {
  return (
    <Disclosure as="nav" className="relative bg-white border-2 border-gray-200 border-solid border-t-0">
      <div className="mx-0 max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-12 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button*/}
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-blue-600 hover:bg-black hover:text-black focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <Link to={'/'}>
                <img
                  alt="Base Editing Dashboard"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      [
                        isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-blue/5 hover:text-blue-950 ",
                        'rounded-md px-3 py-2 text-sm font-medium'
                      ].join(" ")
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                [
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue/5 hover:text-blue-950',
                  'block rounded-md px-3 py-2 text-base font-medium'
                ].join(" ")
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  )
}