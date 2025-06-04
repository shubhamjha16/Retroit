
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // e.g., "3:45"
  albumArtUrl: string;
  genre?: string;
  bpm?: number;
  path?: string; // Path to local file
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  albumArtUrl: string;
  year?: number;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  albums: Album[];
  songs: Song[];
}

export interface Tape { // Playlist
  id: string;
  name: string;
  coverStyleUrl: string; // URL to a cassette/VHS style image
  songs: Song[];
  description?: string;
  userEditable?: boolean; // If user created this tape
}

export interface Mood {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
}
