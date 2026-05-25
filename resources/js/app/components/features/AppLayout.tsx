import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNavBar from './SideNavBar';

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <SideNavBar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="min-h-screen bg-[#f7f9ff] lg:ml-[256px]">
        <div className="sticky top-0 z-20 flex items-center gap-2 bg-[#f7f9ff] px-4 pt-4 pb-2 border-b border-[rgba(193,198,214,0.3)] lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 -ml-1 hover:bg-[rgba(26,115,232,0.1)] active:bg-[rgba(26,115,232,0.15)] transition-colors"
            aria-label="Buka menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="#181c20" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="font-['Roboto',sans-serif] text-sm font-medium text-[#414754]">Menu</span>
        </div>
        <div className="flex min-h-[calc(100vh-48px)] flex-col px-4 pt-3 pb-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </>
  );
}
