import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9ff]">
      <div className="flex flex-1 items-center justify-center px-6">
        <div
          className="w-full max-w-[440px] rounded-[12px] bg-white p-6"
          style={{ boxShadow: '0px 4px 10px rgba(0,91,191,0.08), 0px 1px 1.5px rgba(0,91,191,0.05)' }}
        >
          {children}
        </div>
      </div>
      <footer className="flex flex-col items-center gap-2 px-4 py-6">
        <p className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754]">
          &copy; {new Date().getFullYear()} ParentShield. Digital Stewardship for Every Family.
        </p>
        <div className="flex gap-3">
          <a href="#" className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754] no-underline hover:text-[#005bbf]">Privacy Policy</a>
          <a href="#" className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754] no-underline hover:text-[#005bbf]">Terms of Service</a>
          <a href="#" className="text-center font-['Roboto',sans-serif] text-[12px] font-medium text-[#414754] no-underline hover:text-[#005bbf]">Help Center</a>
        </div>
      </footer>
    </div>
  );
}
