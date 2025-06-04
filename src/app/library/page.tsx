
"use client";

import React, { useRef, useState, type ChangeEvent, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { UploadCloud, ListMusic, Disc3 as AlbumIcon, Users, ListChecks as TapesIcon } from "lucide-react";
import { mockSongs, mockAlbums, mockArtists, mockTapes } from "@/data/mock";
import Image from "next/image";
import type { Song, Album, Artist, Tape } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as jsmediatags from 'jsmediatags';
import type { TagType } from 'jsmediatags';

const SongItem = ({ song }: { song: Song }) => (
  <div className="flex items-center p-3 hover:bg-card/80 rounded-md transition-colors cursor-pointer">
    <Image src={song.albumArtUrl} alt={song.album} width={40} height={40} className="rounded mr-4" data-ai-hint={song.dataAiHint || 'album art'} />
    <div>
      <p className="text-sm font-medium text-foreground">{song.title}</p>
      <p className="text-xs text-muted-foreground">{song.artist} &middot; {song.album}</p>
    </div>
    <span className="ml-auto text-xs text-muted-foreground">{song.duration}</span>
  </div>
);

const AlbumItem = ({ album }: { album: Album }) => (
 <div className="flex flex-col items-center p-3 hover:bg-card/80 rounded-md transition-colors cursor-pointer text-center">
    <Image src={album.albumArtUrl} alt={album.title} width={100} height={100} className="rounded shadow-md mb-2" data-ai-hint={album.dataAiHint}/>
    <p className="text-sm font-medium text-foreground truncate w-full">{album.title}</p>
    <p className="text-xs text-muted-foreground truncate w-full">{album.artist}</p>
  </div>
);

const ArtistItem = ({ artist }: { artist: Artist }) => (
  <div className="flex items-center p-3 hover:bg-card/80 rounded-md transition-colors cursor-pointer">
    {artist.imageUrl && <Image src={artist.imageUrl} alt={artist.name} width={40} height={40} className="rounded-full mr-4" data-ai-hint={artist.dataAiHint}/>}
    {!artist.imageUrl && <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-4"><Users size={20} className="text-muted-foreground"/></div>}
    <div>
      <p className="text-sm font-medium text-foreground">{artist.name}</p>
      <p className="text-xs text-muted-foreground">{artist.albums.length} albums &middot; {artist.songs.length} songs</p>
    </div>
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


export default function LibraryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedSongs, setImportedSongs] = useState<Song[]>([]);
  const [allDisplaySongs, setAllDisplaySongs] = useState<Song[]>(mockSongs);
  const { toast } = useToast();

  useEffect(() => {
    const combinedSongs = [...mockSongs];
    const mockSongIds = new Set(mockSongs.map(s => s.id));
    importedSongs.forEach(importedSong => {
      if (!mockSongIds.has(importedSong.id)) {
        combinedSongs.push(importedSong);
      }
    });
    setAllDisplaySongs(combinedSongs);
  }, [importedSongs]);


  const handleImportMusic = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newSongsPromises = Array.from(files).map((file, index) => {
        return new Promise<Song>((resolve) => {
          jsmediatags.read(file, {
            onSuccess: (tagResult: TagType) => {
              const tags = tagResult.tags;
              let albumArtUrl = `https://placehold.co/60x60/333333/FFFFFF.png?text=${(tags.title || file.name.substring(0, file.name.lastIndexOf('.')) || 'S').charAt(0).toUpperCase()}`;
              let dataAiHintForArt = "music note";

              if (tags.picture) {
                const { data, format } = tags.picture;
                let base64String = "";
                for (let i = 0; i < data.length; i++) {
                  base64String += String.fromCharCode(data[i]);
                }
                albumArtUrl = `data:${format};base64,${window.btoa(base64String)}`;
                dataAiHintForArt = "album art";
              }

              const song: Song = {
                id: `imported-${Date.now()}-${index}`,
                title: tags.title || file.name.substring(0, file.name.lastIndexOf('.')) || "Unknown Title",
                artist: tags.artist || "Unknown Artist",
                album: tags.album || "Unknown Album",
                duration: "0:00", // Placeholder for duration
                albumArtUrl: albumArtUrl,
                genre: tags.genre || "Unknown",
                dataAiHint: dataAiHintForArt, 
                path: file.name,
              };
              resolve(song);
            },
            onError: (error: Error) => {
              console.error(`Error reading tags for ${file.name}:`, error);
              const fallbackTitle = file.name.substring(0, file.name.lastIndexOf('.')) || "Unknown Title";
              const song: Song = {
                id: `imported-${Date.now()}-${index}`,
                title: fallbackTitle,
                artist: "Unknown Artist",
                album: "Unknown Album",
                duration: "0:00",
                albumArtUrl: `https://placehold.co/60x60/333333/FFFFFF.png?text=${fallbackTitle.charAt(0).toUpperCase() || 'S'}`,
                genre: "Unknown",
                dataAiHint: "music note",
                path: file.name,
              };
              resolve(song); 
            }
          });
        });
      });

      try {
        const newSongs = await Promise.all(newSongsPromises);
        setImportedSongs(prevSongs => [...prevSongs, ...newSongs]);
        toast({
          title: "Files Processed",
          description: `${newSongs.length} file(s) processed. Metadata extracted where available. Duration is a placeholder.`,
        });
        console.log("Processed songs:", newSongs);
      } catch (err) {
          console.error("Error processing one or more files:", err);
          toast({
              title: "Processing Error",
              description: "Some files could not be processed.",
              variant: "destructive",
          });
      }
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".mp3,.ogg,.wav,.m4a,.flac" 
        multiple
        onChange={handleFilesSelected}
      />
      <div className="flex justify-between items-center mb-6">
        <SectionTitle className="mb-0">My Library</SectionTitle>
        <Button variant="primary" onClick={handleImportMusic}>
          <UploadCloud className="mr-2 h-4 w-4" /> Import Music
        </Button>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card mb-6">
          <TabsTrigger value="songs" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><ListMusic className="mr-1 h-4 w-4 sm:mr-2" />Songs</TabsTrigger>
          <TabsTrigger value="albums" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><AlbumIcon className="mr-1 h-4 w-4 sm:mr-2" />Albums</TabsTrigger>
          <TabsTrigger value="artists" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="mr-1 h-4 w-4 sm:mr-2" />Artists</TabsTrigger>
          <TabsTrigger value="tapes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><TapesIcon className="mr-1 h-4 w-4 sm:mr-2" />Tapes</TabsTrigger>
        </TabsList>
        <TabsContent value="songs">
          <div className="space-y-2">
            {allDisplaySongs.length > 0 ? (
              allDisplaySongs.map(song => <SongItem key={song.id} song={song} />)
            ) : (
              <p className="text-muted-foreground text-center py-10">Your song library is empty. Import some music!</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="albums">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mockAlbums.map(album => <AlbumItem key={album.id} album={album} />)}
          </div>
           {importedSongs.length > 0 && (
             <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-medium text-muted-foreground mb-3">Imported Albums (Placeholder)</h3>
                <p className="text-sm text-muted-foreground">Album grouping for imported tracks coming soon.</p>
            </div>
           )}
        </TabsContent>
        <TabsContent value="artists">
           <div className="space-y-2">
            {mockArtists.map(artist => <ArtistItem key={artist.id} artist={artist} />)}
          </div>
          {importedSongs.length > 0 && (
             <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-medium text-muted-foreground mb-3">Imported Artists (Placeholder)</h3>
                <p className="text-sm text-muted-foreground">Artist grouping for imported tracks coming soon.</p>
            </div>
           )}
        </TabsContent>
        <TabsContent value="tapes">
          <div className="space-y-2">
            {mockTapes.filter(tape => tape.userEditable).map(tape => <TapeItem key={tape.id} tape={tape} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
