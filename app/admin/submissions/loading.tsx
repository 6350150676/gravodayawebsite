export default function SubmissionsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-44 bg-gray-200 rounded-lg mb-6" />
      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex gap-4">
            <div className="flex gap-2">
              {[1, 2].map((j) => <div key={j} className="w-20 h-16 bg-gray-100 rounded-lg" />)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-64 bg-gray-100 rounded" />
              <div className="h-16 bg-gray-50 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
