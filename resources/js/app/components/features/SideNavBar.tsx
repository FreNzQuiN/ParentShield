import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldIconSmall, HomeIcon, ActivityIcon, DeviceIcon, SettingsIcon, LogoutIcon, CloseIcon } from '../shared/icons';

interface SideNavBarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Halaman Utama', route: '/dashboard', icon: HomeIcon },
  { label: 'Aktivitas Lengkap', route: '/activity', icon: ActivityIcon },
  { label: 'Perangkat Dilindungi', route: '/devices', icon: DeviceIcon },
  { label: 'Pengaturan Akun', route: '/settings', icon: SettingsIcon },
] as const;

export default function SideNavBar({ mobileOpen, onClose }: SideNavBarProps) {
  const { pathname } = useLocation();
  const { onLogout } = useAuth();

  const sidebarContent = (
    <>
      <div className="px-5 py-5 lg:px-6 lg:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldIconSmall />
            <span className="font-['Liberation_Serif',serif] text-[22px] font-bold text-[#005bbf] lg:text-[24px]">
              ParentShield
            </span>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-[rgba(26,115,232,0.1)] lg:hidden" aria-label="Tutup menu">
            <CloseIcon />
          </button>
        </div>
        <p className="font-['Liberation_Serif',serif] text-[12px] text-[#414754]">
          Dashboard Keluarga
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 lg:px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.route);
          const Icon = item.icon;
          return (
            <Link
              key={item.route}
              to={item.route}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors lg:px-4 lg:py-3 ${
                isActive
                  ? 'bg-[rgba(26,115,232,0.1)] text-[#005bbf]'
                  : 'text-[#414754] hover:bg-[rgba(26,115,232,0.05)]'
              }`}
            >
              <Icon
                className={isActive ? 'text-[#005bbf]' : 'text-[#414754]'}
              />
              <span className="font-['Roboto',sans-serif] text-[13px] font-medium tracking-[0.5px] lg:text-[14px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 lg:px-4">
        <button
          onClick={() => { onClose(); onLogout(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[#414754] transition-colors hover:bg-[rgba(26,115,232,0.05)] lg:px-4 lg:py-3"
        >
          <LogoutIcon />
          <span className="font-['Roboto',sans-serif] text-[13px] font-medium tracking-[0.5px] lg:text-[14px]">
            Keluar
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile/tablet overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar desktop (lg+) */}
      <aside className="hidden lg:flex lg:h-screen lg:w-[240px] lg:flex-col lg:bg-[#f1f4fa] lg:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile/tablet */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[256px] flex-col bg-[#f1f4fa] shadow-lg transition-transform lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
