export default function PropertyDetailLoading() {
  return (
    <div className="bg-[var(--color-sand)] min-h-screen pb-16 animate-pulse">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2">
          <div className="h-3 w-10 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-200 rounded" />
          <div className="h-3 w-40 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* Left column */}
          <div className="min-w-0 space-y-6">
            {/* Gallery skeleton */}
            <div className="rounded-2xl overflow-hidden bg-gray-200 aspect-[16/9] w-full" />

            {/* Title block */}
            <div className="space-y-3">
              <div className="h-5 w-24 bg-gray-200 rounded-full" />
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-2">
                  <div className="h-5 w-5 bg-gray-200 rounded-full" />
                  <div className="h-5 w-12 bg-gray-200 rounded" />
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 rounded" />
              <div className="h-4 w-4/6 bg-gray-200 rounded" />
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 w-32 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-300 px-6 py-5 h-24" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-64 bg-gray-200 rounded" />
                <div className="h-10 w-full bg-gray-200 rounded-lg mt-2" />
                <div className="h-10 w-full bg-gray-200 rounded-lg" />
                <div className="h-10 w-full bg-gray-200 rounded-lg" />
                <div className="h-10 w-full bg-gray-200 rounded-xl" />
              </div>
              <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                <div className="h-10 bg-gray-200 rounded-xl" />
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
