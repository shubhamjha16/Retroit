
"use client";

import type { Song } from '@/types';
import Image from 'next/image';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, Maximize2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils'; // Added import

interface NowPlayingBarProps {
  song: Song;
}

// Simple spinning reel SVG component
const SpinningReel = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className={cn("w-5 h-5 animate-spin-reels", className)} style={{ animationDuration: '2s' }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
  </svg>
);

export default function NowPlayingBar({ song }: NowPlayingBarProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false); // Placeholder for full screen player

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressValue(prev => (prev >= 100 ? 0 : prev + 5)); // Simulate progress
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  // Placeholder function for maximizing player
  const toggleMaximizePlayer = () => setIsMaximized(!isMaximized);


  // For a full screen player, you would conditionally render a different layout
  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-background z-[100] p-4 flex flex-col items-center justify-center text-foreground">
        <Button variant="ghost" size="icon" onClick={toggleMaximizePlayer} className="absolute top-4 right-4">
          <Maximize2 className="rotate-180" /> {/* Icon for minimize */}
        </Button>
        <Image src={song.albumArtUrl} alt={song.album} width={300} height={300} className="rounded-lg shadow-2xl shadow-primary/30 mb-8" data-ai-hint={song.dataAiHint} />
        <h2 className="text-3xl font-headline neon-text-primary mb-2">{song.title}</h2>
        <p className="text-xl text-muted-foreground mb-8">{song.artist}</p>
        
        <div className="flex items-center space-x-4 my-4">
          <SpinningReel className="text-primary" />
          <p className="text-lg neon-text-accent">TAPE IS ROLLING</p>
          <SpinningReel className="text-primary" />
        </div>

        <Progress value={progressValue} className="w-full max-w-md h-2 bg-input my-4 [&>div]:bg-primary" />
        <div className="flex items-center justify-center space-x-4 my-4 w-full max-w-md">
          <Button variant="ghost" size="icon"><Shuffle className="text-primary" /></Button>
          <Button variant="ghost" size="icon"><SkipBack className="text-primary" /></Button>
          <Button variant="primary" size="lg" onClick={togglePlay} className="rounded-full w-16 h-16">
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </Button>
          <Button variant="ghost" size="icon"><SkipForward className="text-primary" /></Button>
          <Button variant="ghost" size="icon"><Repeat className="text-primary" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-primary/30 p-3 shadow-t-lg z-40">
      <div className="container mx-auto flex items-center justify-between max-w-md">
        <div className="flex items-center space-x-3 overflow-hidden">
          <Image src={song.albumArtUrl} alt={song.album} width={48} height={48} className="rounded shadow-md" data-ai-hint={song.dataAiHint} />
          <div className="truncate">
            <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
            <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={togglePlay} className="text-primary hover:text-primary/80">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80">
            <SkipForward className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleMaximizePlayer} className="text-muted-foreground hover:text-foreground">
             <Maximize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <Progress value={progressValue} className="w-full h-1 bg-input absolute bottom-0 left-0 right-0 rounded-none [&>div]:bg-primary" />
    </div>
  );
}
