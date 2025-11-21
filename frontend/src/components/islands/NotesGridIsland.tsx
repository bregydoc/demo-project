"use client";

import { useNotes } from "@/lib/hooks";
import { Note } from "@/lib/api";
import NoteCard from "@/components/NoteCard";
import { Suspense } from "react";

interface NotesGridIslandProps {
  categoryId: number | null;
  onNoteClick: (note: Note) => void;
  onNewNote: () => void;
}

function NotesGridContent({ categoryId, onNoteClick }: { categoryId: number | null; onNoteClick: (note: Note) => void }) {
  const { data: notes, isLoading } = useNotes(categoryId || undefined);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading notes...</p>
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return null; // Empty state is handled by parent
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onClick={() => onNoteClick(note)}
        />
      ))}
    </div>
  );
}

export default function NotesGridIsland({ categoryId, onNoteClick, onNewNote }: NotesGridIslandProps) {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading notes...</p>
        </div>
      }
    >
      <NotesGridContent categoryId={categoryId} onNoteClick={onNoteClick} />
    </Suspense>
  );
}

