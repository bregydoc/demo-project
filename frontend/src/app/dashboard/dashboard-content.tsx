"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUser, useNotes } from "@/lib/hooks";
import { Note } from "@/lib/api";
import dynamic from "next/dynamic";

// Dynamically import client islands with no SSR for better streaming
// These are "islands" - isolated client components that hydrate independently
const SidebarIsland = dynamic(
  () => import("@/components/islands/SidebarIsland"),
  {
    ssr: false,
    loading: () => <SidebarSkeleton />
  }
);

const NotesGridIsland = dynamic(
  () => import("@/components/islands/NotesGridIsland"),
  {
    ssr: false,
    loading: () => (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading notes...</p>
      </div>
    )
  }
);

const NoteModalIsland = dynamic(
  () => import("@/components/islands/NoteModalIsland"),
  { ssr: false }
);

function SidebarSkeleton() {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-screen">
      <div className="mb-8">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="h-4 w-24 bg-slate-200 rounded mb-4 animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="h-10 w-full bg-slate-200 rounded-lg animate-pulse" />
    </aside>
  );
}

function NotesGridWrapper({
  categoryId,
  onNoteClick,
  onNewNote,
  NotesGridIsland,
}: {
  categoryId: number | null;
  onNoteClick: (note: Note) => void;
  onNewNote: () => void;
  NotesGridIsland: React.ComponentType<{
    categoryId: number | null;
    onNoteClick: (note: Note) => void;
    onNewNote: () => void;
  }>;
}) {
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
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No notes yet
        </h3>
        <p className="text-slate-500 mb-6">
          Start by creating your first note!
        </p>
        <button
          onClick={onNewNote}
          className="px-6 py-3 bg-teal hover:bg-teal/90 text-white rounded-lg font-medium transition-colors"
        >
          Create Note
        </button>
      </div>
    );
  }

  return (
    <NotesGridIsland
      categoryId={categoryId}
      onNoteClick={onNoteClick}
      onNewNote={onNewNote}
    />
  );
}

export default function DashboardContent() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { data: notes } = useNotes(selectedCategoryId || undefined);

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
      <div className="flex h-screen bg-cream">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const categoryName = selectedCategoryId
    ? notes?.[0]?.category_detail.name || "Notes"
    : "All Notes";

  return (
    <div className="flex h-screen bg-cream">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarIsland
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={setSelectedCategoryId}
        />
      </Suspense>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                {categoryName}
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

          <Suspense
            fallback={
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto"></div>
                <p className="mt-4 text-slate-600">Loading notes...</p>
              </div>
            }
          >
            <NotesGridWrapper
              categoryId={selectedCategoryId}
              onNoteClick={handleNoteClick}
              onNewNote={handleNewNote}
              NotesGridIsland={NotesGridIsland}
            />
          </Suspense>
        </div>
      </main>

      {isModalOpen && (
        <NoteModalIsland
          note={selectedNote}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
