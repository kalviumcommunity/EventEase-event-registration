export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8" aria-busy="true">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large header skeleton */}
        <div className="h-10 bg-gray-200 rounded-md animate-pulse mb-8"></div>

        {/* Event cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6">
              {/* Card title skeleton */}
              <div className="h-6 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              {/* Date skeleton */}
              <div className="h-4 bg-gray-200 rounded-md animate-pulse mb-1"></div>
              {/* Location skeleton */}
              <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
