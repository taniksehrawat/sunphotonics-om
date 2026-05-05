export default function ViewLogsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-6 w-28 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-44 bg-gray-100 rounded"></div>
        </div>
        <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-5">
        <div className="flex gap-4">
          <div className="w-40">
            <div className="h-3 w-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="w-36">
            <div className="h-3 w-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50">
          <div className="flex gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-3 w-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex gap-8">
              <div className="h-4 w-20 bg-gray-100 rounded"></div>
              <div className="h-4 w-32 bg-gray-100 rounded"></div>
              <div className="h-4 w-16 bg-gray-100 rounded"></div>
              <div className="h-4 w-12 bg-gray-100 rounded"></div>
              <div className="h-4 w-16 bg-gray-100 rounded"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}