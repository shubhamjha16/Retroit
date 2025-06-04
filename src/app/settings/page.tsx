
"use client";

import { SectionTitle } from "@/components/SectionTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Palette, LayoutDashboard, Music2, Sparkles } from "lucide-react";

export default function SettingsPage() {
  // Placeholder state for settings
  const [smartShuffle, setSmartShuffle] = useState(true);
  const [homeLayout, setHomeLayout] = useState("default");
  const [nowPlayingTheme, setNowPlayingTheme] = useState("dynamic");

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle>Settings</SectionTitle>

      <div className="space-y-8">
        <Card className="retro-card">
          <CardHeader>
            <CardTitle className="flex items-center font-headline neon-text-accent"><Palette className="mr-2"/>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of RetroSpin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="now-playing-theme" className="text-base">Now Playing Screen Theme</Label>
              <Select value={nowPlayingTheme} onValueChange={setNowPlayingTheme}>
                <SelectTrigger id="now-playing-theme" className="w-[180px] bg-input border-primary/50">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dynamic">Dynamic (Matches Album Art)</SelectItem>
                  <SelectItem value="vhs">VHS Glitch</SelectItem>
                  <SelectItem value="cassette">Classic Cassette</SelectItem>
                  <SelectItem value="minimal">Minimal Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="tape-designs" className="text-base">Default Tape Design</Label>
               <Select defaultValue="random">
                <SelectTrigger id="tape-designs" className="w-[180px] bg-input border-primary/50">
                  <SelectValue placeholder="Select design" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random Retro</SelectItem>
                  <SelectItem value="blank_vhs">Blank VHS</SelectItem>
                  <SelectItem value="80s_cassette">80s Cassette</SelectItem>
                  <SelectItem value="custom">Custom Upload (Soon!)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="retro-card">
          <CardHeader>
            <CardTitle className="flex items-center font-headline neon-text-accent"><Music2 className="mr-2"/>Playback</CardTitle>
            <CardDescription>Control your listening experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="smart-shuffle" className="text-base">Smart Shuffle</Label>
              <Switch id="smart-shuffle" checked={smartShuffle} onCheckedChange={setSmartShuffle} />
            </div>
             <div className="flex items-center justify-between">
              <Label htmlFor="crossfade" className="text-base">Crossfade Duration</Label>
               <Select defaultValue="0">
                <SelectTrigger id="crossfade" className="w-[180px] bg-input border-primary/50">
                  <SelectValue placeholder="Crossfade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Off</SelectItem>
                  <SelectItem value="3">3 seconds</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="8">8 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card className="retro-card">
          <CardHeader>
            <CardTitle className="flex items-center font-headline neon-text-accent"><LayoutDashboard className="mr-2"/>Home Screen</CardTitle>
            <CardDescription>Manage your home feed layout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between">
              <Label htmlFor="home-layout" className="text-base">Home Screen Layout</Label>
              <Select value={homeLayout} onValueChange={setHomeLayout}>
                <SelectTrigger id="home-layout" className="w-[180px] bg-input border-primary/50">
                  <SelectValue placeholder="Select layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default (Mixed)</SelectItem>
                  <SelectItem value="tapes_first">Tapes First</SelectItem>
                  <SelectItem value="moods_focus">Moods Focus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="retro-card">
          <CardHeader>
            <CardTitle className="flex items-center font-headline neon-text-accent"><Sparkles className="mr-2"/>Spotify Connect (Optional)</CardTitle>
            <CardDescription>Sync metadata like album art and release year. No music streaming.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full" onClick={() => alert("Spotify Connect: Feature coming soon!")}>
              Connect to Spotify
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">RetroSpin will never stream music or collect listening data from Spotify.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
