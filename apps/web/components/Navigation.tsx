'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggle from './LanguageToggle';

export default function Navigation() {
  const pathname = usePathname();
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/customer', label: '🏠 Dashboard' },
    { href: '/circles', label: '🔄 My Circles' },
    { href: '/payments', label: '💳 Payments' },
    { href: '/billing', label: '💵 Billing' },
    { href: '/profile', label: '👤 Profile' },
    { href: '/join', label: '🤝 Join Circle' },
    { href: '/rewards', label: '🏆 Rewards' },
    { href: '/support', label: '🆘 Support' },
    { href: '/kyc', label: '🛡️ KYC' },
    { href: '/dashboard', label: 'Dev Tools' },
    { href: '/admin', label: 'Admin' },
    { href: '/admin/disputes', label: '⚖️ Admin Disputes' },
    { href: '/admin/billing', label: '📈 Admin Billing' }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-blue-600">PardnaLink</Link>
          <div className="flex items-center space-x-6">
            <div className="flex space-x-6">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === link.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}