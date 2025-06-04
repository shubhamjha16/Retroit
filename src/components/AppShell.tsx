
"use client";

import React from 'react';
import BottomNav from './BottomNav';
import NowPlayingBar from './NowPlayingBar';
import { currentlyPlayingMock } from '@/data/mock'; // Using mock data for now

export function AppShell({ children }: { children: React.ReactNode }) {
  const [nowPlaying, setNowPlaying] = React.useState(currentlyPlayingMock);
  // In a real app, setNowPlaying would be called when a song starts playing

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow pb-28"> {/* Add padding-bottom to avoid overlap with BottomNav and NowPlayingBar */}
        {children}
      </main>
      {nowPlaying && <NowPlayingBar song={nowPlaying} />}
      <BottomNav />
    </div>
  );
}
