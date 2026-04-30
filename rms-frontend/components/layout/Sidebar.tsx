'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  Table2, CreditCard, Settings, LogOut, ChefHat, Shield,
} from 'lucide-react';
import { useLogout, useCurrentUser } from '@/hooks/useAuth';
import { can } from '@/lib/permissions';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/tables', label: 'Tables', icon: Table2 },
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const logout = useLogout();
  const user = useCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  // Filter nav items based on role
  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#4E342E] flex flex-col z-40 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-[#6D4C41]">
        <div className="w-10 h-10 bg-[#FF8A65] rounded-xl flex items-center justify-center">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Bistro RMS</h1>
          <p className="text-[#BCAAA4] text-xs">Restaurant Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#FF8A65] text-white shadow-md'
                  : 'text-[#BCAAA4] hover:bg-[#6D4C41] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Staff permission note */}
        {!isAdmin && (
          <div className="mt-4 mx-1 p-3 rounded-xl bg-[#3E2723] border border-[#6D4C41]">
            <p className="text-[#BCAAA4] text-xs leading-relaxed">
              <span className="text-[#FF8A65] font-semibold">Staff access:</span> Orders, tables, billing & menu view only.
            </p>
          </div>
        )}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-[#6D4C41]">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
              isAdmin ? 'bg-[#FF8A65]' : 'bg-[#6D4C41]'
            }`}>
              {isAdmin ? <Shield className="w-4 h-4" /> : user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <div className="flex items-center gap-1">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  isAdmin
                    ? 'bg-[#FF8A65]/20 text-[#FF8A65]'
                    : 'bg-[#6D4C41] text-[#BCAAA4]'
                }`}>
                  {isAdmin ? 'Admin' : 'Staff'}
                </span>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#BCAAA4] hover:bg-[#6D4C41] hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
