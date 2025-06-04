
import type { Song, Album, Artist, Tape, Mood } from '@/types';

// Note: For mockSongs to be playable, actual audio files would need to be placed
// in the /public/audio directory matching these paths.
export const mockSongs: Song[] = [
  { id: 's1', title: 'Retrograde Motion', artist: 'Synthwave Rider', album: 'Neon Nights', duration: '4:12', albumArtUrl: 'https://placehold.co/300x300/BF40BF/39FF14.png?text=NN', genre: 'Synthwave', bpm: 120, dataAiHint: 'synthwave album', path: '/audio/s1_retrograde_motion.mp3' },
  { id: 's2', title: 'Pixel Dreams', artist: '8-Bit Hero', album: 'Digital Escape', duration: '3:30', albumArtUrl: 'https://placehold.co/300x300/39FF14/BF40BF.png?text=DE', genre: 'Chiptune', bpm: 140, dataAiHint: 'chiptune pixel', path: '/audio/s2_pixel_dreams.mp3' },
  { id: 's3', title: 'Cassette Love', artist: 'Analog Heart', album: 'Mixtape Memories', duration: '2:55', albumArtUrl: 'https://placehold.co/300x300/222222/39FF14.png?text=MM', genre: 'Lo-fi', bpm: 85, dataAiHint: 'lofi cassette', path: '/audio/s3_cassette_love.mp3' },
  { id: 's4', title: 'Midnight Drive', artist: 'Synthwave Rider', album: 'Neon Nights', duration: '5:01', albumArtUrl: 'https://placehold.co/300x300/BF40BF/39FF14.png?text=NN', genre: 'Synthwave', bpm: 110, dataAiHint: 'night drive', path: '/audio/s4_midnight_drive.mp3' },
  { id: 's5', title: 'VHS Romance', artist: 'Analog Heart', album: 'Mixtape Memories', duration: '3:15', albumArtUrl: 'https://placehold.co/300x300/222222/39FF14.png?text=MM', genre: 'Lo-fi', bpm: 90, dataAiHint: 'vhs tape', path: '/audio/s5_vhs_romance.mp3' },
];

export const mockAlbums: Album[] = [
  { id: 'a1', title: 'Neon Nights', artist: 'Synthwave Rider', albumArtUrl: 'https://placehold.co/300x300/BF40BF/39FF14.png?text=NN', year: 1988, songs: [mockSongs[0], mockSongs[3]], dataAiHint: 'neon city' },
  { id: 'a2', title: 'Digital Escape', artist: '8-Bit Hero', albumArtUrl: 'https://placehold.co/300x300/39FF14/BF40BF.png?text=DE', year: 1985, songs: [mockSongs[1]], dataAiHint: 'pixel art' },
  { id: 'a3', title: 'Mixtape Memories', artist: 'Analog Heart', albumArtUrl: 'https://placehold.co/300x300/222222/39FF14.png?text=MM', year: 1992, songs: [mockSongs[2], mockSongs[4]], dataAiHint: 'cassette tape' },
];

export const mockArtists: Artist[] = [
  { id: 'ar1', name: 'Synthwave Rider', imageUrl: 'https://placehold.co/100x100/BF40BF/FFFFFF.png?text=SR', albums: [mockAlbums[0]], songs: [mockSongs[0], mockSongs[3]], dataAiHint: 'musician portrait' },
  { id: 'ar2', name: '8-Bit Hero', imageUrl: 'https://placehold.co/100x100/39FF14/000000.png?text=8BH', albums: [mockAlbums[1]], songs: [mockSongs[1]], dataAiHint: 'pixel character' },
  { id: 'ar3', name: 'Analog Heart', imageUrl: 'https://placehold.co/100x100/222222/FFFFFF.png?text=AH', albums: [mockAlbums[2]], songs: [mockSongs[2], mockSongs[4]], dataAiHint: 'vintage photo' },
];

export const mockTapes: Tape[] = [
  { id: 't1', name: '80s Drive Mixtape', coverStyleUrl: 'https://placehold.co/300x180/BF40BF/FFFFFF.png?text=80s+Drive', songs: [mockSongs[0], mockSongs[3]], description: 'Synthwave classics for late night drives.', userEditable: true, dataAiHint: 'cassette design' },
  { id: 't2', name: 'Chill Vibes Only', coverStyleUrl: 'https://placehold.co/300x180/39FF14/000000.png?text=Chill', songs: [mockSongs[2], mockSongs[4]], description: 'Relax and unwind with these lo-fi beats.', userEditable: true, dataAiHint: 'vhs design' },
  { id: 't3', name: 'Recently Played', coverStyleUrl: 'https://placehold.co/300x180/222222/39FF14.png?text=Recent', songs: [mockSongs[0], mockSongs[1], mockSongs[2]], description: 'Your recent jams.', userEditable: false, dataAiHint: 'tape stack' },
];

export const mockMoods: Mood[] = [
  { id: 'm1', name: 'Chill Waves', imageUrl: 'https://placehold.co/200x120/BF40BF/FFFFFF.png?text=Chill', description: 'Relaxing synth and lo-fi.', dataAiHint: 'abstract waves' },
  { id: 'm2', name: 'Throwback Arcade', imageUrl: 'https://placehold.co/200x120/39FF14/000000.png?text=Arcade', description: '8-bit and chiptune classics.', dataAiHint: 'arcade machine' },
  { id: 'm3', name: 'High Energy Beats', imageUrl: 'https://placehold.co/200x120/FF0000/FFFFFF.png?text=Energy', description: 'Upbeat tracks to get you moving.', dataAiHint: 'sound bars' },
];

// For AI recommendations
export const listeningHistoryExample: string = "Retrograde Motion,Pixel Dreams";
export const songMetadataExample: string =
  "Retrograde Motion:Synthwave:Synthwave Rider:120," +
  "Pixel Dreams:Chiptune:8-Bit Hero:140," +
  "Cassette Love:Lo-fi:Analog Heart:85," +
  "Midnight Drive:Synthwave:Synthwave Rider:110," +
  "VHS Romance:Lo-fi:Analog Heart:90," +
  "Future Funk:Funk:Cosmic Grooves:115," +
  "Neon Grid:Outrun:Vector Pilot:125," +
  "Game Over:Chiptune:8-Bit Hero:150," +
  "Sunset Cruise:Synthwave:Sunset Driver:100";

export const currentlyPlayingMock: Song | null = null; // Initialize with no song playing
