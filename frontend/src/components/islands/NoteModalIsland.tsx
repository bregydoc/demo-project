"use client";

import { Note } from "@/lib/api";
import NoteModal from "@/components/NoteModal";

interface NoteModalIslandProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteModalIsland({
  note,
  isOpen,
  onClose,
}: NoteModalIslandProps) {
  return <NoteModal note={note} isOpen={isOpen} onClose={onClose} />;
}

