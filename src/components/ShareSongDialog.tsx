
"use client";

import { useState } from 'react';
import type { Song } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareSongDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  song: Song | null;
}

export default function ShareSongDialog({ isOpen, onOpenChange, song }: ShareSongDialogProps) {
  const [dummyLink, setDummyLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateDummyLink = () => {
    if (song) {
      // In a real app, this would involve WebRTC setup and signaling server interaction
      const randomId = Math.random().toString(36).substring(2, 10);
      const generatedLink = `https://retrospin.app/share/${randomId}?song=${encodeURIComponent(song.title)}`;
      setDummyLink(generatedLink);
      setCopied(false);
    }
  };

  const handleCopyLink = () => {
    if (dummyLink) {
      navigator.clipboard.writeText(dummyLink).then(() => {
        setCopied(true);
        toast({ title: "Link Copied!" });
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        console.error('Failed to copy link: ', err);
        toast({ title: "Failed to copy", description: "Could not copy link to clipboard.", variant: "destructive" });
      });
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setDummyLink(null); // Reset dummy link when dialog closes
        setCopied(false);
    }
    onOpenChange(open);
  }

  if (!song) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="font-headline neon-text-primary">Share "{song.title}"</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share this song directly with another RetroSpin user using peer-to-peer (P2P) technology.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-foreground">
            RetroSpin can conceptually use WebRTC (like ToffeeShare) to transfer files directly between browsers.
            This means the file goes from your device to the recipient's device without being stored on a central server.
          </p>
          {!dummyLink && (
             <Button variant="primary" onClick={generateDummyLink} className="w-full">
                Generate Share Link
             </Button>
          )}
          {dummyLink && (
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Share this link with the recipient:</p>
                <div className="flex items-center space-x-2">
                    <Input value={dummyLink} readOnly className="bg-input border-primary/50 text-sm" />
                    <Button variant="ghost" size="icon" onClick={handleCopyLink} title="Copy link">
                        {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
                 <p className="text-xs text-muted-foreground pt-2">
                    <strong>Note:</strong> This is a conceptual demonstration. Full P2P file sharing requires complex WebRTC logic for connection establishment (signaling) and data transfer, which is not implemented here. The recipient would need to open this link in their RetroSpin app.
                </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    