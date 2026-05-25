import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import { ToastProvider } from '../../app/contexts/ToastProvider';
import * as authApi from '../../app/services/api/auth';

vi.mock('../../app/services/api/auth');

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </ToastProvider>
  );
}

describe('ForgotPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email form', () => {
    render(<ForgotPassword />, { wrapper: Wrapper });
    expect(screen.getByText('Atur Ulang Kata Sandi')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim link reset/i })).toBeInTheDocument();
  });

  it('shows validation for empty email', async () => {
    render(<ForgotPassword />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /kirim link reset/i }));
    expect(await screen.findByText('Email wajib diisi.')).toBeInTheDocument();
  });

  it('shows success state after sending', async () => {
    vi.mocked(authApi.forgotPassword).mockResolvedValue(undefined);
    render(<ForgotPassword />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /kirim link reset/i }));

    await waitFor(() => {
      expect(screen.getByText('Periksa email Anda untuk link reset kata sandi.')).toBeInTheDocument();
    });
    expect(screen.getByText('Kembali ke Masuk')).toHaveAttribute('href', '/login');
  });

  it('has link back to login', () => {
    render(<ForgotPassword />, { wrapper: Wrapper });
    expect(screen.getByText('Kembali ke Masuk')).toHaveAttribute('href', '/login');
  });

  it('disables form when loading', async () => {
    vi.mocked(authApi.forgotPassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );
    render(<ForgotPassword />, { wrapper: Wrapper });

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /kirim link reset/i }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled();
    });
  });
});
