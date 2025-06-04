
"use client";

import React from 'react';
import BottomNav from './BottomNav';
import NowPlayingBar from './NowPlayingBar';
import { usePlayerContext } from '@/contexts/PlayerContext';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { nowPlayingSong } = usePlayerContext();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pb-28"> {/* Add padding-bottom to avoid overlap with BottomNav and NowPlayingBar */}
        {children}
      </main>
      {nowPlayingSong && <NowPlayingBar song={nowPlayingSong} />}
      <BottomNav />
    </div>
  );
}
