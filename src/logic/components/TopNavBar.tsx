import { NavLink, Link } from 'react-router-dom';

const navigation = [
  { name: 'Base Editing Dashboard', href: '/'},
  { name: 'About', href: '/about'},
];

export default function TopNavBar() {
  return (
    <nav className="bg-white border-b-2 border-gray-200">
      <div className="mx-auto max-w-5xl px-8">
        <div className="flex h-12 items-center justify-center gap-6">
          <div className="flex gap-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  [
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue/5 hover:text-blue-950',
                    'rounded-md px-3 py-2 text-sm font-medium'
                  ].join(' ')
                }
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
