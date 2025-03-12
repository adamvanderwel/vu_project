'use client';

import { HomeIcon, Zap, Download, Bell, User, BanknoteIcon, ShoppingCart, FileText, FileBarChart, AlertTriangle, LineChart, Eye, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export const TopNav = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { label: 'Overview', icon: HomeIcon, href: '/overzicht' },
    { label: 'Production', icon: Zap, href: '/productie' },
    { label: 'Market Prices', icon: LineChart, href: '/marktprijzen' },
    { label: 'Financial', icon: BanknoteIcon, href: '/financieel' },
    { label: 'Data', icon: FileText, href: '/data' },
    { label: 'GOs', icon: FileBarChart, href: '/gos' },
    { label: 'Outages', icon: AlertTriangle, href: '/outages' },
  ];

  return (
    <header className="flex flex-col bg-white shadow-sm">
      {/* Top section */}
      <div className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-gray-100">
        {/* Left section */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            vandebron
          </Link>
        </div>

        {/* Right section - Hide on mobile */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-sm">Production</span>
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

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-500" />
          ) : (
            <Menu className="w-6 h-6 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation section - Desktop */}
      <nav className="hidden md:block h-12 px-8 border-b border-gray-100">
        <ul className="h-full flex items-center gap-8 overflow-x-auto">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link 
                href={item.href}
                className={`flex items-center gap-2 px-1 py-3 text-sm transition-colors relative whitespace-nowrap ${
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <nav className="bg-white border-b">
            <ul className="py-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm ${
                      pathname === item.href
                        ? 'text-black bg-gray-50 font-medium' 
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-4">
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
          </nav>
        </div>
      )}
    </header>
  );
}; 