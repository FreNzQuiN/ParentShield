import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNavBar from './SideNavBar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <SideNavBar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="min-h-screen bg-bg-page lg:ml-[256px]">
        <div className="sticky top-0 z-20 flex items-center gap-2 bg-bg-page px-4 pt-4 pb-2 border-b border-border/30 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 -ml-1 hover:bg-primary-light active:bg-primary/15 transition-colors"
            aria-label="Buka menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-text-primary">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="text-sm font-medium text-text-secondary">Menu</span>
        </div>
        <div className="flex min-h-[calc(100vh-48px)] flex-col px-4 pt-3 pb-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
}
