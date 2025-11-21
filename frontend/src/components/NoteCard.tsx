"use client";

import { Note } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border-2 hover:shadow-lg transition-all cursor-pointer p-4 h-full"
      style={{ borderColor: note.category_detail.color_hex }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: note.category_detail.color_hex }}
        />
        <span className="text-xs text-slate-500">
          {note.category_detail.name}
        </span>
      </div>

      <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">
        {note.title || "Untitled"}
      </h3>

      <p className="text-sm text-slate-600 line-clamp-3 mb-3">
        {note.content || "No content"}
      </p>

      <div className="text-xs text-slate-400">
        {formatDate(note.updated_at)}
      </div>
    </div>
  );
}

