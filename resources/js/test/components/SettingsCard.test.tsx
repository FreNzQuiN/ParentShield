import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsCard from '../../app/components/shared/SettingsCard';

describe('SettingsCard', () => {
  it('renders title', () => {
    render(<SettingsCard title="My Settings" description="Description text">Content</SettingsCard>);
    expect(screen.getByText('My Settings')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<SettingsCard title="Title" description="My Description">Content</SettingsCard>);
    expect(screen.getByText('My Description')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<SettingsCard title="Title" description="Desc"><div data-testid="child">Child Content</div></SettingsCard>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
