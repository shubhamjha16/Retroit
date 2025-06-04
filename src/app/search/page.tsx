
"use client";

import { SectionTitle } from "@/components/SectionTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { mockSongs, mockAlbums, mockArtists, mockTapes } from "@/data/mock";
import type { Song, Album, Artist, Tape } from "@/types";
import Image from "next/image";

// Re-using item components from Library page for consistency
const SongItem = ({ song }: { song: Song }) => (
  <div className="flex items-center p-3 hover:bg-card/80 rounded-md transition-colors cursor-pointer">
    <Image src={song.albumArtUrl} alt={song.album} width={40} height={40} className="rounded mr-4" data-ai-hint={song.dataAiHint}/>
    <div>
      <p className="text-sm font-medium text-foreground">{song.title}</p>
      <p className="text-xs text-muted-foreground">{song.artist} &middot; {song.album}</p>
    </div>
    <span className="ml-auto text-xs text-muted-foreground">{song.duration}</span>
  </div>
);

const AlbumItem = ({ album }: { album: Album }) => (
 <div className="flex flex-col items-center p-3 hover:bg-card/80 rounded-md transition-colors cursor-pointer text-center">
    <Image src={album.albumArtUrl} alt={album.title} width={60} height={60} className="rounded shadow-md mb-2" data-ai-hint={album.dataAiHint}/>
    <p className="text-xs font-medium text-foreground truncate w-full">{album.title}</p>
    <p className="text-[10px] text-muted-foreground truncate w-full">{album.artist}</p>
  </div>
);

const ArtistItem = ({ artist }: { artist: Artist }) => (
  <div className="flex items-center p-3 hover:bg-card/80 rounded-md transition-colors cursor-pointer">
    {artist.imageUrl && <Image src={artist.imageUrl} alt={artist.name} width={40} height={40} className="rounded-full mr-4" data-ai-hint={artist.dataAiHint}/>}
    {!artist.imageUrl && <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4"><Users size={20} className="text-muted-foreground"/></div>}
    <p className="text-sm font-medium text-foreground">{artist.name}</p>
  </div>
);

const TapeItem = ({ tape }: { tape: Tape }) => (
  <div className="flex items-center p-3 hover:bg-card/80 rounded-md transition-colors cursor-pointer">
    <Image src={tape.coverStyleUrl} alt={tape.name} width={60} height={36} className="rounded mr-4 object-cover" data-ai-hint={tape.dataAiHint}/>
    <div>
      <p className="text-sm font-medium text-foreground">{tape.name}</p>
      <p className="text-xs text-muted-foreground">{tape.songs.length} songs</p>
    </div>
  </div>
);


export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<{ songs: Song[], albums: Album[], artists: Artist[], tapes: Tape[] } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }
    // Mock search logic
    const lowerSearchTerm = searchTerm.toLowerCase();
    setResults({
      songs: mockSongs.filter(s => s.title.toLowerCase().includes(lowerSearchTerm) || s.artist.toLowerCase().includes(lowerSearchTerm)),
      albums: mockAlbums.filter(a => a.title.toLowerCase().includes(lowerSearchTerm) || a.artist.toLowerCase().includes(lowerSearchTerm)),
      artists: mockArtists.filter(ar => ar.name.toLowerCase().includes(lowerSearchTerm)),
      tapes: mockTapes.filter(t => t.name.toLowerCase().includes(lowerSearchTerm)),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle>Search</SectionTitle>
      <form onSubmit={handleSearch} className="flex w-full items-center space-x-2 mb-8">
        <Input 
          type="text" 
          placeholder="Search songs, artists, albums, tapes..." 
          className="bg-input border-primary/50 focus:ring-primary focus:border-primary text-base" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button type="submit" variant="primary">
          <SearchIcon className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>

      {results && (
        <div className="space-y-8">
          {results.songs.length > 0 && (
            <section>
              <h3 className="font-headline text-xl neon-text-accent mb-3">Songs</h3>
              <div className="space-y-2">{results.songs.map(s => <SongItem key={s.id} song={s} />)}</div>
            </section>
          )}
          {results.albums.length > 0 && (
            <section>
              <h3 className="font-headline text-xl neon-text-accent mb-3">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.map(a => <AlbumItem key={a.id} album={a} />)}
              </div>
            </section>
          )}
          {results.artists.length > 0 && (
            <section>
              <h3 className="font-headline text-xl neon-text-accent mb-3">Artists</h3>
              <div className="space-y-2">{results.artists.map(ar => <ArtistItem key={ar.id} artist={ar} />)}</div>
            </section>
          )}
          {results.tapes.length > 0 && (
            <section>
              <h3 className="font-headline text-xl neon-text-accent mb-3">Tapes</h3>
              <div className="space-y-2">{results.tapes.map(t => <TapeItem key={t.id} tape={t} />)}</div>
            </section>
          )}
          {results.songs.length === 0 && results.albums.length === 0 && results.artists.length === 0 && results.tapes.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No results found for "{searchTerm}". Try another search?</p>
          )}
        </div>
      )}
      {!results && searchTerm && (
         <p className="text-muted-foreground text-center py-8">Searching for "{searchTerm}"...</p>
      )}
       {!results && !searchTerm && (
         <p className="text-muted-foreground text-center py-8">Enter a term above to search your retro library!</p>
      )}
    </div>
  );
}
