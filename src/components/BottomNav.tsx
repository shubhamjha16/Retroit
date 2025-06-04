
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Search, Disc3, SettingsIcon as Settings } from 'lucide-react'; // Using Disc3 for Tapes
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/tapes', label: 'Tapes', icon: Disc3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/30 shadow-t-lg z-50">
      <div className="container mx-auto flex justify-around items-center h-16 max-w-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} legacyBehavior>
              <a className={cn(
                "flex flex-col items-center justify-center p-2 rounded-md transition-colors",
                isActive ? 'text-primary neon-text-primary' : 'text-muted-foreground hover:text-foreground'
              )}>
                <item.icon className={cn("w-6 h-6", isActive ? "drop-shadow-neon-primary" : "")} />
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
