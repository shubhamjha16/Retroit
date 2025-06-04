
"use client";

import { useParams, useRouter } from 'next/navigation';
import { mockMoods, mockSongs } from '@/data/mock';
import type { Song, Mood } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Shuffle, ArrowLeft } from 'lucide-react';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePlayerContext } from '@/contexts/PlayerContext';

const SongItem = ({ song, onPlay }: { song: Song; onPlay: (song: Song) => void }) => (
  <div 
    className="flex items-center p-3 hover:bg-accent/10 rounded-md transition-colors cursor-pointer"
    onClick={() => onPlay(song)}
  >
    <Image src={song.albumArtUrl} alt={song.album} width={48} height={48} className="rounded shadow-md mr-4" data-ai-hint={song.dataAiHint} />
    <div className="flex-grow">
      <p className="text-sm font-medium text-foreground">{song.title}</p>
      <p className="text-xs text-muted-foreground">{song.artist}</p>
    </div>
    <span className="text-xs text-muted-foreground">{song.duration}</span>
  </div>
);

export default function MoodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moodId = params.id as string;
  const { playSong } = usePlayerContext();

  const mood = mockMoods.find(m => m.id === moodId);

  // Mock: Filter songs based on mood.
  const moodSongs = mockSongs.filter((_, index) => {
    if (mood?.name.toLowerCase().includes("chill")) return index % 3 === 0;
    if (mood?.name.toLowerCase().includes("arcade")) return index % 3 === 1;
    if (mood?.name.toLowerCase().includes("energy")) return index % 3 === 2;
    return true; 
  }).slice(0, 10); 

  if (!mood) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <SectionTitle>Mood Not Found</SectionTitle>
        <p className="text-muted-foreground">The requested mood could not be found.</p>
        <Button variant="link" onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4"/> Go Back</Button>
      </div>
    );
  }
  
  const handlePlaySong = (songToPlay: Song) => {
    playSong(songToPlay);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-muted-foreground hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4"/> Back
      </Button>
      <div className="relative mb-8 h-56 rounded-lg overflow-hidden shadow-xl shadow-primary/20">
        <Image 
          src={mood.imageUrl} 
          alt={mood.name} 
          fill // Changed from layout="fill" objectFit="cover"
          style={{objectFit: "cover"}}
          className="opacity-70"
          data-ai-hint={mood.dataAiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 z-10">
          <h1 className="font-headline text-4xl lg:text-5xl text-foreground mt-1">{mood.name}</h1>
          {mood.description && <p className="text-muted-foreground mt-2 max-w-lg">{mood.description}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-3 mb-8">
        <Button size="lg" variant="primary" onClick={() => moodSongs.length > 0 && handlePlaySong(moodSongs[0])} disabled={moodSongs.length === 0}>
          <Play className="mr-2 h-5 w-5" /> Play Mood
        </Button>
        <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10 hover:text-accent" disabled={moodSongs.length === 0}>
          <Shuffle className="mr-2 h-5 w-5" /> Shuffle
        </Button>
      </div>

      <Card className="retro-card bg-card/80">
        <CardContent className="p-2 sm:p-4">
          {moodSongs.length > 0 ? (
            <div className="space-y-1">
              {moodSongs.map((song, index) => (
                <SongItem key={song.id || index} song={song} onPlay={handlePlaySong} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">No songs available for this mood right now.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
