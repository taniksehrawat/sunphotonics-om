import Image from 'next/image';

export default function DashboardBanner() {
  return (
    <div className="relative rounded-xl overflow-hidden mb-5 h-32 sm:h-40 bg-gradient-to-r from-yellow-600 to-orange-500">
      {/* Overlay text */}
      <div className="absolute inset-0 bg-black/30 flex items-center px-6 z-10">
        <div className="text-white">
          <h2 className="text-xl font-bold">☀️ Solar Revenue Dashboard</h2>
          <p className="text-sm opacity-90 mt-1">
            Monitor your solar assets and track earnings in real-time
          </p>
        </div>
      </div>
      
      {/* Background pattern - solar panels grid effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-6 gap-1 h-full">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white/30"
              style={{ transform: `skewY(-5deg)` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}