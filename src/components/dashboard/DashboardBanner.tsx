export default function DashboardBanner() {
  return (
    <div className="relative rounded-xl overflow-hidden mb-5 h-32 sm:h-40">
      {/* The actual image */}
      <img
        src="/images/solar-banner.jpg"
        alt="Solar Panels"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Text content on top */}
      <div className="absolute inset-0 flex items-center px-6">
        <div className="text-white">
          <h2 className="text-xl sm:text-2xl font-bold">☀️ Solar Revenue Dashboard</h2>
          <p className="text-sm sm:text-base opacity-90 mt-1">
            Monitor your solar assets and track earnings in real-time
          </p>
        </div>
      </div>
    </div>
  );
}