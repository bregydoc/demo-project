"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useNotes } from "@/lib/hooks";
import { Note } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import NoteCard from "@/components/NoteCard";
import NoteModal from "@/components/NoteModal";

export default function DashboardPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { data: notes, isLoading: notesLoading } = useNotes(selectedCategoryId || undefined);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth");
    }
  }, [user, userLoading, router]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-cream">
      <Sidebar
        selectedCategoryId={selectedCategoryId}
        onCategorySelect={setSelectedCategoryId}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                {selectedCategoryId
                  ? notes?.[0]?.category_detail.name || "Notes"
                  : "All Notes"}
              </h2>
              <p className="text-slate-600 mt-1">
                Welcome back, {user.username}!
              </p>
            </div>
            <button
              onClick={handleNewNote}
              className="px-6 py-3 bg-teal hover:bg-teal/90 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              + New Note
            </button>
          </div>

          {notesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading notes...</p>
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onClick={() => handleNoteClick(note)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No notes yet
              </h3>
              <p className="text-slate-500 mb-6">
                Start by creating your first note!
              </p>
              <button
                onClick={handleNewNote}
                className="px-6 py-3 bg-teal hover:bg-teal/90 text-white rounded-lg font-medium transition-colors"
              >
                Create Note
              </button>
            </div>
          )}
        </div>
      </main>

      <NoteModal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}

