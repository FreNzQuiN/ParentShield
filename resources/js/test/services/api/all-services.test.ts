import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../app/services/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../../../app/services/api/client';
import { fetchQueryLog } from '../../../app/services/api/activity';
import { login, register, logout, me, forgotPassword, refresh, updateProfile, changePassword } from '../../../app/services/api/auth';
import { fetchDashboard, fetchServices, updateSafebrowsing, updateParentalControl } from '../../../app/services/api/dashboard';
import { fetchDevices, createDevice, getDevice, updateDevice, deleteDevice } from '../../../app/services/api/devices';
import { storeApiKey, checkStatus } from '../../../app/services/api/setupApiKey';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('activity API', () => {
  it('fetchQueryLog calls GET /logs/query with params', async () => {
    const mockData = { items: [], pages: [] };
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockData } });

    const result = await fetchQueryLog({ time_from_millis: 1000, time_to_millis: 2000 });
    expect(api.get).toHaveBeenCalledWith('/logs/query', { params: { time_from_millis: 1000, time_to_millis: 2000 } });
    expect(result).toEqual(mockData);
  });
});

describe('auth API', () => {
  it('login calls POST /auth/login', async () => {
    const mockData = { user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: false }, token: 'tok' };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await login('a@b.com', 'pass');
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
    expect(result).toEqual(mockData);
  });

  it('register calls POST /auth/register', async () => {
    const mockData = { user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: false }, token: 'tok' };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await register('Test', 'a@b.com', 'pass', 'pass');
    expect(api.post).toHaveBeenCalledWith('/auth/register', { name: 'Test', email: 'a@b.com', password: 'pass', password_confirmation: 'pass' });
    expect(result).toEqual(mockData);
  });

  it('logout calls POST /auth/logout', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } });
    await logout();
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('me calls GET /auth/me', async () => {
    const mockData = { user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: true } };
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await me();
    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockData);
  });

  it('forgotPassword calls POST /auth/forgot-password', async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { success: true } });
    await forgotPassword('a@b.com');
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'a@b.com' });
  });

  it('refresh calls POST /auth/refresh', async () => {
    const mockData = { user: { id: 1, name: 'Test', email: 'a@b.com', has_api_key: false }, token: 'newtok' };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await refresh();
    expect(api.post).toHaveBeenCalledWith('/auth/refresh');
    expect(result).toEqual(mockData);
  });

  it('updateProfile calls PUT /auth/profile', async () => {
    const mockData = { user: { id: 1, name: 'New', email: 'a@b.com', has_api_key: false } };
    vi.mocked(api.put).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await updateProfile('New');
    expect(api.put).toHaveBeenCalledWith('/auth/profile', { name: 'New' });
    expect(result).toEqual(mockData);
  });

  it('changePassword calls PUT /auth/password', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { success: true } });
    await changePassword('old', 'new', 'new');
    expect(api.put).toHaveBeenCalledWith('/auth/password', { current_password: 'old', password: 'new', password_confirmation: 'new' });
  });
});

describe('dashboard API', () => {
  it('fetchDashboard calls GET /dashboard', async () => {
    const mockData = { stats: {} };
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await fetchDashboard();
    expect(api.get).toHaveBeenCalledWith('/dashboard');
    expect(result).toEqual(mockData);
  });

  it('fetchServices calls GET /dashboard/services', async () => {
    const mockData = [{ id: '9gag', name: '9GAG', icon_svg: '<svg></svg>' }];
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await fetchServices();
    expect(api.get).toHaveBeenCalledWith('/dashboard/services');
    expect(result).toEqual(mockData);
  });

  it('updateSafebrowsing calls PUT /dashboard/safebrowsing', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { success: true } });
    await updateSafebrowsing('block_nrd_enabled', true);
    expect(api.put).toHaveBeenCalledWith('/dashboard/safebrowsing', { key: 'block_nrd_enabled', value: true });
  });

  it('updateParentalControl calls PUT /dashboard/parental-control', async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { success: true } });
    await updateParentalControl('enabled', true);
    expect(api.put).toHaveBeenCalledWith('/dashboard/parental-control', { key: 'enabled', value: true });
  });
});

describe('devices API', () => {
  it('fetchDevices calls GET /devices', async () => {
    const mockData = { devices: [], account_limits: { devices: { used: 0, max: 5 } } };
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await fetchDevices();
    expect(api.get).toHaveBeenCalledWith('/devices');
    expect(result).toEqual(mockData);
  });

  it('createDevice calls POST /devices', async () => {
    const mockData = { id: '1', name: 'Phone', device_type: 'ANDROID' };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await createDevice('Phone', 'ANDROID');
    expect(api.post).toHaveBeenCalledWith('/devices', { name: 'Phone', device_type: 'ANDROID' });
    expect(result).toEqual(mockData);
  });

  it('getDevice calls GET /devices/:id', async () => {
    const mockData = { id: '1', name: 'Phone', device_type: 'ANDROID' };
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await getDevice('1');
    expect(api.get).toHaveBeenCalledWith('/devices/1');
    expect(result).toEqual(mockData);
  });

  it('updateDevice calls PUT /devices/:id', async () => {
    const mockData = { id: '1', name: 'New Name', device_type: 'ANDROID' };
    vi.mocked(api.put).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await updateDevice('1', 'New Name');
    expect(api.put).toHaveBeenCalledWith('/devices/1', { name: 'New Name' });
    expect(result).toEqual(mockData);
  });

  it('deleteDevice calls DELETE /devices/:id', async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: { success: true } });
    await deleteDevice('1');
    expect(api.delete).toHaveBeenCalledWith('/devices/1');
  });
});

describe('setupApiKey API', () => {
  it('storeApiKey calls POST /setup-api-key', async () => {
    const mockData = { has_api_key: true };
    vi.mocked(api.post).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await storeApiKey('ag_test');
    expect(api.post).toHaveBeenCalledWith('/setup-api-key', { api_key: 'ag_test' });
    expect(result).toEqual(mockData);
  });

  it('checkStatus calls GET /setup-api-key/status', async () => {
    const mockData = { has_api_key: false };
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: mockData } });
    const result = await checkStatus();
    expect(api.get).toHaveBeenCalledWith('/setup-api-key/status');
    expect(result).toEqual(mockData);
  });
});
