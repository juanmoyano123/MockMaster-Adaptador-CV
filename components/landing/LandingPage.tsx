/**
 * Landing Page Component
 * Main container for all landing page sections
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks';
import FeaturesSection from './FeaturesSection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  const { user, signOut } = useAuth();
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-semibold text-slate-900 text-lg">MockMaster</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
                Cómo funciona
              </a>

              {user ? (
                <>
                  <Link href="/upload" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">
                      {user.user_metadata?.name || user.email}
                    </span>
                    <button
                      onClick={() => signOut()}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Comenzar
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Comenzar
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        <HeroSection />
        <HowItWorks />
        <FeaturesSection />
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
