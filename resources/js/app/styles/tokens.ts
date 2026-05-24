export const tokens = {
  color: {
    primary: {
      DEFAULT: '#005bbf',
      light: '#1a73e8',
      dark: '#004a9e',
    },
    success: '#1b6d24',
    successBadge: '#a0f399',
    error: '#ba1a1a',
    errorLight: '#ffb3ac',
    warning: '#f59e0b',
    text: {
      primary: '#181c20',
      secondary: '#414754',
      muted: '#727785',
    },
    bg: {
      page: '#f7f9ff',
      sidebar: '#f1f4fa',
      card: '#ffffff',
      inner: '#f7f9ff',
      tag: '#ebeef4',
    },
    border: {
      DEFAULT: 'rgba(193,198,214,0.2)',
      inner: 'rgba(193,198,214,0.3)',
      toggle: 'rgba(193,198,214,0.1)',
    },
    chart: {
      primary: '#005bbf',
      blue: '#adc7ff',
      barBg: '#ebeef4',
      peak: '#005bbf',
    },
  },
  fontSize: {
    hero: '2rem',         // 32px — welcome heading
    h2: '1.5rem',         // 24px — page title
    h3: '1.25rem',        // 20px — section title
    body: '0.875rem',     // 14px — body text, input values, placeholders
    label: '0.875rem',    // 14px — form labels, button text
    caption: '0.75rem',   // 12px — helper text, footer
  },
  fontFamily: {
    sans: 'Roboto, sans-serif',
    serif: 'Liberation Serif, serif',
  },
  radius: {
    card: '12px',
    input: '8px',
    full: '9999px',
  },
  layout: {
    sidebarWidth: '256px',
    contentMaxWidth: '1024px',
    cardPadding: '13px',
    cardPaddingLg: '24px',
    pagePadding: '24px',
  },
} as const;
