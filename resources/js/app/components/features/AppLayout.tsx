import { Outlet } from 'react-router-dom';
import SideNavBar from './SideNavBar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <SideNavBar />
      <main className="flex-1 bg-[#f7f9ff] p-4 pt-14 overflow-auto md:p-6 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
