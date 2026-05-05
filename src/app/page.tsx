import Link from 'next/link';
import { Sun, Zap, Shield, BarChart3, CheckCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Sun className="h-8 w-8 text-yellow-500" />
          <span className="text-xl font-bold text-gray-900">Sunphotonics O&M</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Solar O&M Management<br />Made Simple
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Streamline your solar plant operations, track daily generation, manage maintenance tickets, and generate reports — all in one platform.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center px-8 py-4 bg-yellow-600 text-white rounded-xl text-lg font-semibold hover:bg-yellow-700 shadow-lg"
        >
          Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Zap, title: 'Daily Logs', desc: 'Submit generation data with images in seconds' },
            { icon: BarChart3, title: 'Analytics', desc: 'Real-time KPIs and performance charts' },
            { icon: Shield, title: 'Maintenance', desc: 'Ticket management with full lifecycle tracking' },
            { icon: CheckCircle, title: 'Reports', desc: 'Generate PDF & Excel reports instantly' },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
              <feature.icon className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Sunphotonics O&M. All rights reserved.
      </footer>
    </div>
  );
}