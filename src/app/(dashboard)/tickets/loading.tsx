export default function TicketsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-40 bg-gray-100 rounded"></div>
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-5">
        <div className="flex gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1">
              <div className="h-3 w-12 bg-gray-200 rounded mb-2"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket cards */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex gap-3 mb-3">
            <div className="h-5 w-48 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-100 rounded-full"></div>
            <div className="h-5 w-14 bg-gray-100 rounded-full"></div>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded mb-3"></div>
          <div className="flex gap-4">
            <div className="h-3 w-24 bg-gray-100 rounded"></div>
            <div className="h-3 w-16 bg-gray-100 rounded"></div>
            <div className="h-3 w-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}