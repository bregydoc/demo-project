"use client";

import { useEffect, useRef, useState } from "react";
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

  // Reset form when note changes
  useEffect(() => {
    if (note) {
      reset({
        title: note.title,
        content: note.content,
        category: note.category,
      });
    } else if (categories && Array.isArray(categories) && categories.length > 0) {
      reset({
        title: "",
        content: "",
        category: categories[0].id,
      });
    }
  }, [note, categories, reset]);

  // Auto-save on blur with debouncing
  const debouncedSave = useRef(
    debounce(async (data: NoteFormData) => {
      if (!data.title.trim()) return; // Don't save empty notes

      setIsSaving(true);
      try {
        if (note) {
          await updateMutation.mutateAsync({
            id: note.id,
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
          // Close modal after creating
          onClose();
        }
      } finally {
        setIsSaving(false);
      }
    }, 500)
  ).current;

  const handleFieldBlur = () => {
    const data = watch();
    debouncedSave(data);
  };

  const handleDelete = async () => {
    if (note && confirm("Are you sure you want to delete this note?")) {
      await deleteMutation.mutateAsync(note.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {note ? "Edit Note" : "New Note"}
          </h2>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-sm text-slate-500">Saving...</span>
            )}
            <button
              onClick={onClose}
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
          {note ? (
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
            onClick={onClose}
            className="px-6 py-2 bg-teal hover:bg-teal/90 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

