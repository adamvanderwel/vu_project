'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, Zap, BanknoteIcon, ShoppingCart, FileText, FileBarChart, AlertTriangle, LineChart, Eye } from 'lucide-react';

export const SideNav = () => {
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
    <nav className="w-48 bg-white border-r min-h-screen">
      <ul className="py-4">
        {navItems.map((item) => (
          <li key={item.label}>
            <Link 
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm ${
                pathname === item.href
                  ? 'text-black border-b-2 border-black font-medium' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}; 