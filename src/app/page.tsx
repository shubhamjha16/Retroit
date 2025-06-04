
"use client";

import React, { useState, useEffect } from 'react';
import { mockTapes, mockMoods, listeningHistoryExample, songMetadataExample } from '@/data/mock';
import TapeCard from '@/components/TapeCard';
import MoodCard from '@/components/MoodCard';
import { SectionTitle } from '@/components/SectionTitle';
import { recommendSongs, RecommendSongsInput, RecommendSongsOutput } from '@/ai/flows/recommend-songs';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Play as PlayIcon } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Song } from '@/types';
import { mockSongs } from '@/data/mock';
import Image from 'next/image';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { usePlayerContext } from '@/contexts/PlayerContext';

export default function HomePage() {
  const [suggestedSongs, setSuggestedSongs] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [errorSuggestions, setErrorSuggestions] = useState<string | null>(null);
  const { playSong } = usePlayerContext();

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setErrorSuggestions(null);
    try {
      const input: RecommendSongsInput = {
        listeningHistory: listeningHistoryExample, 
        songMetadata: songMetadataExample, 
      };
      const result: RecommendSongsOutput = await recommendSongs(input);
      setSuggestedSongs(result.recommendedSongs.split(',').map(s => s.trim()).filter(s => s));
    } catch (error) {
      console.error("Error fetching song suggestions:", error);
      setErrorSuggestions("Failed to load song suggestions. Please try again.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const displayableSuggestedSongs: Song[] = suggestedSongs
    .map(title => mockSongs.find(s => s.title === title))
    .filter((s): s is Song => s !== undefined)
    .slice(0, 5); 

  const handlePlaySong = (songToPlay: Song) => {
    playSong(songToPlay);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl sm:text-5xl neon-text-primary tracking-wider">RetroSpin</h1>
        <p className="text-muted-foreground mt-2">Your Offline Mixtape Universe</p>
      </header>

      <section>
        <SectionTitle>Recently Played</SectionTitle>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 pb-4">
            {mockTapes.filter(tape => !tape.userEditable).map((tape) => ( 
              <div key={tape.id} className="w-64 shrink-0">
                <TapeCard tape={tape} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      <section>
        <SectionTitle>Featured Moods</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {mockMoods.map((mood) => (
            <MoodCard key={mood.id} mood={mood} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>For You</SectionTitle>
        {isLoadingSuggestions && <div className="flex justify-center items-center h-32"><LoadingSpinner size={48} /></div>}
        {errorSuggestions && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorSuggestions} <Button variant="link" onClick={fetchSuggestions} className="p-0 h-auto text-destructive-foreground">Try again</Button></AlertDescription>
          </Alert>
        )}
        {!isLoadingSuggestions && !errorSuggestions && displayableSuggestedSongs.length > 0 && (
          <div className="space-y-3">
            {displayableSuggestedSongs.map(song => (
              <div 
                key={song.id} 
                className="flex items-center p-3 bg-card/50 rounded-lg retro-card hover:bg-card/70 transition-colors cursor-pointer"
                onClick={() => handlePlaySong(song)}
              >
                <Image src={song.albumArtUrl} alt={song.album} width={40} height={40} className="rounded mr-3" data-ai-hint={song.dataAiHint} />
                <div className="flex-grow">
                  <p className="text-sm font-medium text-foreground">{song.title}</p>
                  <p className="text-xs text-muted-foreground">{song.artist}</p>
                </div>
                <PlayIcon className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
        {!isLoadingSuggestions && !errorSuggestions && displayableSuggestedSongs.length === 0 && (
          <p className="text-muted-foreground">No suggestions available right now. Play some music to get recommendations!</p>
        )}
      </section>
      
      <section>
        <SectionTitle>Search Your Library</SectionTitle>
        <div className="flex w-full max-w-sm items-center space-x-2 mx-auto">
          <Input type="text" placeholder="Song, artist, album, tape..." className="bg-input border-primary/50 focus:ring-primary focus:border-primary" />
          <Button type="submit" variant="primary">Search</Button>
        </div>
      </section>

    </div>
  );
}
