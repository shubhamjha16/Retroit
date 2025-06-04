
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // e.g., "3:45"
  albumArtUrl: string;
  genre?: string;
  bpm?: number;
  path?: string; // Path to local file or URL
  dataAiHint?: string; // For placeholder image generation
  file?: File; // Actual file object for imported songs
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  year?: number;
  songs: Song[];
  dataAiHint?: string;
}

export interface Artist {
  id:string;
  name: string;
  imageUrl?: string;
  albums: Album[];
  songs: Song[];
  dataAiHint?: string;
}

export interface Tape { // Playlist
  id: string;
  name: string;
  coverStyleUrl: string; // URL to a cassette/VHS style image
  songs: Song[]; // Could be array of song IDs or Song objects
  description?: string;
  userEditable?: boolean; // If user created this tape
  dataAiHint?: string;
}

export interface Mood {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  dataAiHint?: string;
}
