export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-56 bg-gray-100 rounded"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 w-28 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-50 rounded"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-5 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}