import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldIconSmall, HomeIcon, ActivityIcon, DeviceIcon, SettingsIcon, LogoutIcon, CloseIcon } from '../shared/icons';

const navItems = [
  { label: 'Halaman Utama', route: '/dashboard', icon: HomeIcon },
  { label: 'Aktivitas Lengkap', route: '/activity', icon: ActivityIcon },
  { label: 'Perangkat Dilindungi', route: '/devices', icon: DeviceIcon },
  { label: 'Pengaturan Akun', route: '/settings', icon: SettingsIcon },
] as const;

export default function SideNavBar() {
  const { pathname } = useLocation();
  const { onLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      <div className="px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIconSmall />
            <span className="font-['Liberation_Serif',serif] text-[22px] font-bold text-[#005bbf] md:text-[24px]">
              ParentShield
            </span>
          </div>
          <button onClick={closeMobile} className="rounded p-1 hover:bg-[rgba(26,115,232,0.1)] md:hidden" aria-label="Tutup menu">
            <CloseIcon />
          </button>
        </div>
        <p className="font-['Liberation_Serif',serif] text-[12px] text-[#414754]">
          Dashboard Keluarga
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 md:px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.route);
          const Icon = item.icon;
          return (
            <Link
              key={item.route}
              to={item.route}
              onClick={closeMobile}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors md:px-4 md:py-3 ${
                isActive
                  ? 'bg-[rgba(26,115,232,0.1)] text-[#005bbf]'
                  : 'text-[#414754] hover:bg-[rgba(26,115,232,0.05)]'
              }`}
            >
              <Icon
                className={isActive ? 'text-[#005bbf]' : 'text-[#414754]'}
              />
              <span className="font-['Roboto',sans-serif] text-[13px] font-medium tracking-[0.5px] md:text-[14px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 md:px-4">
        <button
          onClick={() => { closeMobile(); onLogout(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[#414754] transition-colors hover:bg-[rgba(26,115,232,0.05)] md:px-4 md:py-3"
        >
          <LogoutIcon />
          <span className="font-['Roboto',sans-serif] text-[13px] font-medium tracking-[0.5px] md:text-[14px]">
            Keluar
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-30 rounded-lg bg-white p-2 shadow-md md:hidden"
        aria-label="Buka menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="#181c20" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeMobile} />
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:h-screen md:w-[240px] md:flex-col md:bg-[#f1f4fa] md:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col bg-[#f1f4fa] shadow-lg transition-transform md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
