import { Suspense } from "react";
import DashboardContent from "./dashboard-content";

function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-cream">
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
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-8 w-32 bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border-2 border-slate-200 p-4 h-48 animate-pulse" />
              ))}
            </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
