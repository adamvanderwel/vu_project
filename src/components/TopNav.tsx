'use client';

import { HomeIcon, Zap, Download, Bell, User, BanknoteIcon, ShoppingCart, FileText, FileBarChart, AlertTriangle, LineChart, Eye } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const TopNav = () => {
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Overzicht', icon: HomeIcon, href: '/overzicht' },
    { label: 'Productie', icon: Zap, href: '/' },
    { label: 'Producer Inzicht', icon: Eye, href: '/productie' },
    { label: 'Marktprijzen', icon: LineChart, href: '/marktprijzen' },
    { label: 'Financieel', icon: BanknoteIcon, href: '/financieel' },
    { label: 'Verkoop', icon: ShoppingCart, href: '/verkoop' },
    { label: 'Gegevens', icon: FileText, href: '/gegevens' },
    { label: "GVO's", icon: FileBarChart, href: '/gvos' },
    { label: 'Uitval', icon: AlertTriangle, href: '/uitval' },
  ];

  return (
    <header className="flex flex-col bg-white shadow-sm">
      {/* Top section */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-gray-100">
        {/* Left section */}
        <div className="flex items-center">
          <div className="text-xl font-bold">
            vandebron
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Productie</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <HomeIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Herengracht 545A</span>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-200" />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">John Doe</span>
                <span className="text-xs text-gray-500">108973791</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors">
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors relative">
                <Bell className="w-4 h-4 text-gray-500" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <nav className="h-12 px-8 border-b border-gray-100">
        <ul className="h-full flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                href={item.href}
                className={`flex items-center gap-2 px-1 py-3 text-sm transition-colors relative ${
                  pathname === item.href
                    ? 'text-black font-medium' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}; 