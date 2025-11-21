"use client";

import { useCategories, useLogout } from "@/lib/hooks";
import { useRouter } from "next/navigation";

interface SidebarProps {
  selectedCategoryId: number | null;
  onCategorySelect: (id: number | null) => void;
}

export default function Sidebar({
  selectedCategoryId,
  onCategorySelect,
}: SidebarProps) {
  const { data: categories, isLoading } = useCategories();
  const logoutMutation = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    router.push("/auth");
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Aesthetic Notes</h1>
      </div>

      <div className="flex-1">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Categories
        </h2>

        <div className="space-y-2">
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
              selectedCategoryId === null
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Notes</span>
          </button>

          {isLoading ? (
            <div className="text-sm text-slate-500 px-4 py-2">Loading...</div>
          ) : (
            categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategoryId === category.id
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color_hex }}
                  />
                  <span>{category.name}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {category.note_count}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
      >
        Sign Out
      </button>
    </aside>
  );
}

