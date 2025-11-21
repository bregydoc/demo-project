"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Note } from "@/lib/api";
import { useCategories, useCreateNote, useUpdateNote, useDeleteNote } from "@/lib/hooks";
import { debounce } from "@/lib/utils";

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

type NoteFormData = {
  title: string;
  content: string;
  category: number;
};

export default function NoteModal({ note, isOpen, onClose }: NoteModalProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, watch, reset, setValue } = useForm<NoteFormData>({
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      category: note?.category || categories?.[0]?.id || 1,
    },
  });

  // Track the current note ID to switch from create -> update mode
  const [currentNoteId, setCurrentNoteId] = useState<number | null>(note?.id || null);
  // Use a ref to track the latest ID for the debounced function
  const currentNoteIdRef = useRef(currentNoteId);

  // Update ref when state changes
  useEffect(() => {
    currentNoteIdRef.current = currentNoteId;
  }, [currentNoteId]);

  // Reset form when note prop changes
  useEffect(() => {
    if (note) {
      setCurrentNoteId(note.id);
      reset({
        title: note.title,
        content: note.content,
        category: note.category,
      });
    } else if (categories && Array.isArray(categories) && categories.length > 0) {
      // Only reset to empty if we don't have a currentNoteId (meaning we are truly creating new)
      if (!currentNoteId) {
        reset({
          title: "",
          content: "",
          category: categories[0].id,
        });
      }
    }
  }, [note, categories, reset]); // Removed currentNoteId from deps to prevent infinite reset loop

  const performSave = useCallback(
    async (data: NoteFormData) => {
      if (!data.title.trim()) return; // Don't save empty notes

      setIsSaving(true);
      try {
        const idToUpdate = currentNoteIdRef.current || note?.id;

        if (idToUpdate) {
          await updateMutation.mutateAsync({
            id: idToUpdate,
            data: {
              title: data.title,
              content: data.content,
              category: data.category,
            },
          });
        } else {
          const newNote = await createMutation.mutateAsync({
            title: data.title,
            content: data.content,
            category: data.category,
          });
          setCurrentNoteId(newNote.id);
        }
      } catch (error) {
        console.error("Failed to save note:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [createMutation, updateMutation, note]
  );

  // Auto-save on blur with debouncing
  const debouncedSave = useMemo(() => debounce((data: NoteFormData) => {
    void performSave(data);
  }, 500), [performSave]);

  // Clear state when closing
  const handleClose = () => {
    setCurrentNoteId(null);
    onClose();
  };

  const handleFieldBlur = () => {
    const data = watch();
    debouncedSave(data);
  };

  const handleDelete = async () => {
    const idToDelete = currentNoteId || note?.id;
    if (idToDelete && confirm("Are you sure you want to delete this note?")) {
      await deleteMutation.mutateAsync(idToDelete);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {currentNoteId || note ? "Edit Note" : "New Note"}
          </h2>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-slate-500">Saving...</span>
            )}
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            {categoriesLoading ? (
              <div className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500">
                Loading categories...
              </div>
            ) : categories && Array.isArray(categories) && categories.length > 0 ? (
              <select
                {...register("category")}
                onBlur={handleFieldBlur}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
                ⚠️ Unable to load categories. Please refresh the page.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              {...register("title")}
              onBlur={handleFieldBlur}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
              placeholder="Enter note title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content
            </label>
            <textarea
              {...register("content")}
              onBlur={handleFieldBlur}
              rows={12}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
              placeholder="Start writing..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-between">
          {currentNoteId || note ? (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete Note
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={async () => {
              const data = watch();
              await performSave(data);
              handleClose();
            }}
            className="px-6 py-2 bg-teal hover:bg-teal/90 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

