import { type HTMLAttributes, type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function ShieldIcon(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex size-[40px] items-center justify-center rounded-full bg-[#005bbf]" {...props}>
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
        <path d="M8 0L0 3v7c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V3L8 0zm0 2.18L14 4.3v5.7c0 4.55-2.77 8.73-6 9.94V2.18z" fill="white" />
      </svg>
    </div>
  );
}

export function ShieldIconSmall(props: IconProps) {
  return (
    <svg width="16" height="22" viewBox="0 0 16 22" fill="none" {...props}>
      <path d="M8 0L0 3v7c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V3L8 0zm0 2.18L14 4.3v5.7c0 4.55-2.77 8.73-6 9.94V2.18z" fill="#005bbf" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" {...props}>
      <path d="M11 0C6 0 1.73 3.11 0 7.5 1.73 11.89 6 15 11 15s9.27-3.11 11-7.5C20.27 3.11 16 0 11 0zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#727785" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg width="22" height="15" viewBox="0 0 22 15" fill="none" {...props}>
      <path d="M11 0C6 0 1.73 3.11 0 7.5c1.12 2.78 3.07 5.06 5.6 6.52l-1.12 1.93 1.73 1 1.13-1.95c1.2.46 2.46.7 3.66.7s2.46-.24 3.66-.7l1.13 1.95 1.73-1-1.12-1.93c2.53-1.46 4.48-3.74 5.6-6.52C20.27 3.11 16 0 11 0zM11 3c1.66 0 3 1.34 3 3 0 .6-.18 1.16-.48 1.64l-4.15-4.16C10.24 3.07 10.62 3 11 3zM5.5 6c0-.6.18-1.16.48-1.64L3.84 2.78C2.42 4.03 1.41 5.69.88 7.5 1.73 10.39 4.2 12.5 7 12.5c1.03 0 2.03-.2 2.93-.56L8.78 10.8C8.36 10.94 7.94 11 7.5 11c-2.21 0-4-1.79-4-4s1.79-4 4-4 .59.06.86.18l4.1-4.12C11.7 2.04 10.86 2 10 2c-2.8 0-5.3 2.11-6.16 4.98.09.33.2.66.34.98.17-.34.37-.66.6-.96H5.5z" fill="#727785" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 8C9.933 8 11.5 6.433 11.5 4.5S9.933 1 8 1 4.5 2.567 4.5 4.5 6.067 8 8 8zm0 2c-3.315 0-6 1.79-6 4v1h12v-1c0-2.21-2.685-4-6-4z" fill="#727785" />
    </svg>
  );
}

export function EmailIcon(props: IconProps) {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" {...props}>
      <path d="M18 0H2C.9 0 0 .9 0 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V2l8 5 8-5v2z" fill="#727785" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg width="16" height="21" viewBox="0 0 16 21" fill="none" {...props}>
      <path d="M13 7h-1V5c0-2.76-2.24-5-5-5S2 2.24 2 5v2H1c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM8 15.17c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM10.5 7h-5V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v2z" fill="#727785" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 0L6.59 1.41 12.17 7H0v2h12.17l-5.58 5.59L8 16l8-8z" fill="white" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M10 2L1 9h3v8h5v-5h2v5h5V9h3L10 2z" fill="currentColor" />
    </svg>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M2 10h3l2-5 3 10 2-5 2 3h4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DeviceIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <rect x="3" y="1" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M10 15h0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M10 13a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M17 10h0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M14 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10h10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 17H3V3h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M6 4l4 4-4 4" stroke="#414754" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DashboardQueryIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1C4.58 1 1 4.58 1 9s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-9H8v5h2V6zm0 6H8v2h2v-2z" fill="#005bbf" />
    </svg>
  );
}

export function DashboardBlockIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1L2 4v5c0 4.5 3 8.5 7 9 4-.5 7-4.5 7-9V4L9 1zm0 2.5L14 5.7v3.3c0 3.3-2.1 6.4-5 7.3V3.5z" fill="#ba1a1a" />
    </svg>
  );
}

export function DashboardDeviceIcon(props: IconProps) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="1" width="14" height="16" rx="2" stroke="#1b6d24" strokeWidth="1.5" fill="none" />
      <circle cx="9" cy="13" r="1.5" fill="#1b6d24" />
    </svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M10 1L2 4v5c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V4l-8-3z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M2 10h16M10 2a15 15 0 010 16M10 2a15 15 0 00-6 8 15 15 0 006 8M10 2a15 15 0 016 8 15 15 0 01-6 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M21 4l-2 2m-4-2l-6 6m-2.5 2.5A3.5 3.5 0 102 13.5a3.5 3.5 0 006.5 2.5L12 12l2 2 2-2-2-2 2-2-2-2" stroke="#727785" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 9l2-2" stroke="#727785" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
