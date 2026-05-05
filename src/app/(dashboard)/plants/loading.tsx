export default function PlantsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-6 w-28 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-40 bg-gray-100 rounded"></div>
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
              <div className="h-5 w-14 bg-gray-100 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-100 rounded"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-4 w-36 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}