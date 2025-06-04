
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Library, Search, Disc3, SettingsIcon as Settings, Expand, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/tapes', label: 'Tapes', icon: Disc3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isDocumentFullscreen, setIsDocumentFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsDocumentFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Initial check
    setIsDocumentFullscreen(!!document.fullscreenElement);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleToggleBrowserFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        toast({ title: "Fullscreen Error", description: "Could not enter fullscreen mode.", variant: "destructive"});
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
          toast({ title: "Fullscreen Error", description: "Could not exit fullscreen mode.", variant: "destructive"});
        });
      }
    }
  }, [toast]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-primary/30 shadow-t-lg z-50">
      <div className="container mx-auto flex justify-around items-center h-16 max-w-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} legacyBehavior>
              <a className={cn(
                "flex flex-col items-center justify-center p-2 rounded-md transition-colors w-1/5", // Added w-1/6 for even distribution with 6 items
                isActive ? 'text-primary neon-text-primary' : 'text-muted-foreground hover:text-foreground'
              )}>
                <item.icon className={cn("w-6 h-6", isActive ? "drop-shadow-neon-primary" : "")} />
                <span className="text-xs mt-1">{item.label}</span>
              </a>
            </Link>
          );
        })}
        <button
          onClick={handleToggleBrowserFullscreen}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground w-1/5" // Added w-1/6
          )}
          title={isDocumentFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isDocumentFullscreen ? <Minimize2 className="w-6 h-6" /> : <Expand className="w-6 h-6" />}
          <span className="text-xs mt-1 truncate">{isDocumentFullscreen ? "Exit FS" : "Fullscreen"}</span>
        </button>
      </div>
    </nav>
  );
}
