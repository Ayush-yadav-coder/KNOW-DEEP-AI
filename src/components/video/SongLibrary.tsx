import React, { useState } from "react";
import { Music, Play, Pause, Check, Search, Filter, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  url: string;
  mood: string;
}

const FREE_SONGS: Song[] = [
  {
    id: "s1",
    title: "Midnight City Breeze",
    artist: "Lofi Collective",
    duration: "2:45",
    genre: "Lofi / Chill",
    mood: "Relaxing",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: "s2",
    title: "Cinematic Horizons",
    artist: "Epic Studio",
    duration: "3:12",
    genre: "Epic / Cinematic",
    mood: "Inspirational",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: "s3",
    title: "Digital Pulse",
    artist: "Cyber Beats",
    duration: "2:58",
    genre: "Electronic / Synth",
    mood: "Energetic",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: "s4",
    title: "Golden Hour Acoustic",
    artist: "Folk Dreams",
    duration: "2:30",
    genre: "Acoustic / Folk",
    mood: "Warm",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: "s5",
    title: "Shadows in the Fog",
    artist: "Mystery Soundscapes",
    duration: "4:05",
    genre: "Ambient / Dark",
    mood: "Suspenseful",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: "s6",
    title: "Neon Rain",
    artist: "Synth Runner",
    duration: "3:20",
    genre: "Synthwave",
    mood: "Futuristic",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: "s7",
    title: "Deep Sea Echoes",
    artist: "Abyssal Sounds",
    duration: "5:12",
    genre: "Ambient",
    mood: "Calm",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    id: "s8",
    title: "Summer Heatwave",
    artist: "Tropical Vibes",
    duration: "3:45",
    genre: "Pop / Upbeat",
    mood: "Happy",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
  },
  {
    id: "s9",
    title: "Ancient Whispers",
    artist: "Tribal Quest",
    duration: "4:20",
    genre: "World / Ethnic",
    mood: "Mysterious",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  },
  {
    id: "s10",
    title: "Urban Grind",
    artist: "Street Beats",
    duration: "2:15",
    genre: "Hip Hop",
    mood: "Gritty",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
  }
];

interface SongLibraryProps {
  onSelectSong: (song: Song) => void;
  selectedSongId?: string;
}

export function SongLibrary({ onSelectSong, selectedSongId }: SongLibraryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const genres = ["All", ...Array.from(new Set(FREE_SONGS.map(s => s.genre.split(" / ")[0])))];

  const filteredSongs = FREE_SONGS.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === "All" || song.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const handleTogglePlay = (song: Song) => {
    if (playingId === song.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = song.url;
        audioRef.current.play();
      }
      setPlayingId(song.id);
    }
  };

  return (
    <div className="space-y-4 bg-card border border-border/80 rounded-2xl p-4 shadow-inner">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Music className="w-4 h-4 text-primary" />
          <span>Professional Song Library</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border border-border rounded-lg pl-8 pr-3 py-1 text-[10px] w-32 focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-2 py-1 text-[10px] focus:ring-1 focus:ring-primary"
          >
            {genres.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        <AnimatePresence mode="popLayout">
          {filteredSongs.map((song) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={song.id}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                selectedSongId === song.id
                  ? "bg-primary/10 border-primary"
                  : "bg-muted/5 border-border/60 hover:bg-muted/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTogglePlay(song)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    playingId === song.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted-foreground/20 text-foreground"
                  }`}
                >
                  {playingId === song.id ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                  )}
                </button>
                <div>
                  <div className="text-[11px] font-bold text-foreground leading-tight">{song.title}</div>
                  <div className="text-[10px] text-muted-foreground">{song.artist} • {song.duration}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted border border-border/50 text-muted-foreground">
                      {song.mood}
                    </span>
                    <span className="text-[9px] text-muted-foreground italic">{song.genre}</span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant={selectedSongId === song.id ? "default" : "outline"}
                onClick={() => {
                  if (selectedSongId === song.id) {
                    onSelectSong({ id: "", title: "", artist: "", duration: "", genre: "", url: "", mood: "" });
                  } else {
                    onSelectSong(song);
                  }
                }}
                className={`h-8 px-3 rounded-lg text-[10px] font-bold ${
                  selectedSongId === song.id ? "bg-primary" : "border-border/60"
                }`}
              >
                {selectedSongId === song.id ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Applied
                  </span>
                ) : (
                  "Apply to Project"
                )}
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredSongs.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground italic">
            No matching tracks found in library.
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        onEnded={() => setPlayingId(null)}
        className="hidden"
      />
      
      <div className="pt-2 flex items-center gap-2 border-t border-border/40">
        <Volume2 className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground font-medium italic">
          Tip: Preview songs before applying them to your video timeline.
        </span>
      </div>
    </div>
  );
}
