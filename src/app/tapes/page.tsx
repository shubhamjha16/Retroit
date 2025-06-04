
"use client";

import { SectionTitle } from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { mockTapes } from "@/data/mock";
import TapeCard from "@/components/TapeCard";
import Link from "next/link";

export default function TapesPage() {
  // Filter for user-editable tapes, assuming these are the user's playlists
  const userTapes = mockTapes.filter(tape => tape.userEditable);

  const handleCreateTape = () => {
    alert("Create new tape functionality to be implemented. This would open a modal or form to name the tape and select songs.");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <SectionTitle className="mb-0">My Tapes</SectionTitle>
        <Button variant="primary" onClick={handleCreateTape}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Tape
        </Button>
      </div>

      {userTapes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {userTapes.map((tape) => (
            <TapeCard key={tape.id} tape={tape} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ListChecks size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">You haven't created any tapes yet.</p>
          <Button variant="secondary" onClick={handleCreateTape}>
            Make Your First Mixtape!
          </Button>
        </div>
      )}
       <div className="mt-12">
        <SectionTitle>Generated Tapes</SectionTitle>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mockTapes.filter(tape => !tape.userEditable).map((tape) => (
            <TapeCard key={tape.id} tape={tape} />
          ))}
        </div>
      </div>
    </div>
  );
}
