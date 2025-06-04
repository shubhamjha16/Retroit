
"use client";

import type { Song } from '@/types';
import Image from 'next/image';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Maximize2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { TapeLoadAnimation } from './TapeLoadAnimation'; // Import the new animation component

interface NowPlayingBarProps {
  song: Song | null; // Allow song to be null initially
}

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
  const [isMaximized, setIsMaximized] = useState(false);
  const [showLoadAnimation, setShowLoadAnimation] = useState(false);
  const [prevSongId, setPrevSongId] = useState<string | null>(null);

  const parseDuration = (durationStr: string | undefined): number => {
    if (!durationStr) return 180; // Default duration if undefined
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      if (!isNaN(minutes) && !isNaN(seconds)) {
        return minutes * 60 + seconds;
      }
    }
    return 180; // Default to 3 minutes if parsing fails
  };

  useEffect(() => {
    // Song change effect for animation and playback reset
    if (song && song.id !== prevSongId) {
      if (prevSongId !== null) { // Only trigger animation if it's not the initial song load
        setShowLoadAnimation(true);
        const animationTimer = setTimeout(() => {
          setShowLoadAnimation(false);
        }, 1500); // Animation duration (1s slide + 0.5s fade)
         setIsPlaying(true); // Autoplay new song
        setProgressValue(0); // Reset progress for new song
        
        return () => clearTimeout(animationTimer);
      }
      setPrevSongId(song.id);
       // For the very first song, also set to play and reset progress
      if (prevSongId === null) {
        setIsPlaying(true);
        setProgressValue(0);
      }
    } else if (!song) {
      // If song becomes null (e.g., queue ends)
      setIsPlaying(false);
      setProgressValue(0);
      setPrevSongId(null);
    }
  }, [song, prevSongId]);

  useEffect(() => {
    // Progress simulation effect
    let interval: NodeJS.Timeout;
    if (isPlaying && song) {
      const totalDurationSeconds = parseDuration(song.duration);
      if (totalDurationSeconds > 0) {
        interval = setInterval(() => {
          setProgressValue(prev => {
            // Increment progress slightly each second
            const increment = (1 / totalDurationSeconds) * 100;
            const newProgress = prev + increment;
            if (newProgress >= 100) {
              setIsPlaying(false); // Stop playing when song ends
              return 100;
            }
            return newProgress;
          });
        }, 1000); // Update every second
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, song]);

  const togglePlay = () => {
    if (!song) return;
    if (progressValue >= 100 && !isPlaying) { // If song ended and user hits play, restart
      setProgressValue(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMaximizePlayer = () => setIsMaximized(!isMaximized);

  if (!song) return null; // Don't render bar if no song

  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-background z-[100] p-4 flex flex-col items-center justify-center text-foreground">
        {showLoadAnimation && <TapeLoadAnimation />}
        <Button variant="ghost" size="icon" onClick={toggleMaximizePlayer} className="absolute top-4 right-4 text-primary hover:text-primary/80">
          <Maximize2 className="rotate-180" />
        </Button>
        <Image src={song.albumArtUrl} alt={song.album} width={300} height={300} className="rounded-lg shadow-2xl shadow-primary/30 mb-8" data-ai-hint={song.dataAiHint || 'album cover'} />
        <h2 className="text-3xl font-headline neon-text-primary mb-2 text-center">{song.title}</h2>
        <p className="text-xl text-muted-foreground mb-6 text-center">{song.artist}</p>
        
        <div className="flex items-center space-x-4 my-4">
          <SpinningReel className={cn("text-primary", !isPlaying && "opacity-50")} />
          <p className="text-lg neon-text-accent font-semibold">{isPlaying ? "TAPE IS ROLLING" : "TAPE PAUSED"}</p>
          <SpinningReel className={cn("text-primary", !isPlaying && "opacity-50")} />
        </div>

        <Progress value={progressValue} className="w-full max-w-md h-2 bg-input my-4 [&>div]:bg-primary" />
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 my-4 w-full max-w-md">
          <Button variant="ghost" size="icon"><Shuffle className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button>
          <Button variant="ghost" size="icon"><SkipBack className="text-primary w-6 h-6 sm:w-7 sm:h-7" /></Button>
          <Button variant="primary" size="lg" onClick={togglePlay} className="rounded-full w-16 h-16 sm:w-20 sm:h-20">
            {isPlaying ? <Pause size={32} /> : <Play size={32} />}
          </Button>
          <Button variant="ghost" size="icon"><SkipForward className="text-primary w-6 h-6 sm:w-7 sm:h-7" /></Button>
          <Button variant="ghost" size="icon"><Repeat className="text-primary w-5 h-5 sm:w-6 sm:h-6" /></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-primary/30 p-3 shadow-t-lg z-40">
      <div className="container mx-auto flex items-center justify-between max-w-md">
        <div className="flex items-center space-x-3 overflow-hidden flex-1 min-w-0">
          <Image src={song.albumArtUrl} alt={song.album} width={48} height={48} className="rounded shadow-md flex-shrink-0" data-ai-hint={song.dataAiHint || 'album cover'} />
          <div className="truncate flex-1">
            <p className="text-sm font-medium text-foreground truncate">{song.title}</p>
            <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
          <Button variant="ghost" size="icon" onClick={togglePlay} className="text-primary hover:text-primary/80">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-primary hover:text-primary/80 hidden sm:inline-flex"> {/* Hide skip on very small screens */}
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
