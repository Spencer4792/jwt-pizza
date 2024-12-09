import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../../views/adminDashboard';
import { pizzaService } from '../../service/service';
import { Role } from '../../service/pizzaService';
import { vi } from 'vitest';

// Mock the service and navigation
vi.mock('../../service/service', () => ({
  pizzaService: {
    getFranchises: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate
  };
});

describe('AdminDashboard', () => {
  const mockFranchises = [
    {
      id: '1',
      name: 'Test Franchise',
      admins: [{ name: 'Admin 1', email: 'admin@test.com' }],
      stores: [
        { id: '1', name: 'Store 1', totalRevenue: 1000 }
      ]
    }
  ];

  const mockAdminUser = {
    id: '1',
    name: 'Admin',
    email: 'admin@test.com',
    password: 'password',
    roles: [{ role: Role.Admin }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pizzaService.getFranchises).mockResolvedValue(mockFranchises);
  });

  it('renders dashboard for admin user', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    expect(await screen.findByText("Mama Ricci's kitchen")).toBeInTheDocument();
    expect(screen.getByText('Test Franchise')).toBeInTheDocument();
    expect(screen.getByText('Admin 1')).toBeInTheDocument();
    expect(screen.getByText('Store 1')).toBeInTheDocument();
    expect(screen.getByText('1,000 ₿')).toBeInTheDocument();
  });

  it('navigates to create franchise page', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    const addButton = await screen.findByText('Add Franchise');
    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard/create-franchise');
  });

  it('shows NotFound for non-admin user', () => {
    const nonAdminUser = { ...mockAdminUser, roles: [{ role: Role.Diner }] };
    render(
      <BrowserRouter>
        <AdminDashboard user={nonAdminUser} />
      </BrowserRouter>
    );

    expect(screen.queryByText("Mama Ricci's kitchen")).not.toBeInTheDocument();
  });
});