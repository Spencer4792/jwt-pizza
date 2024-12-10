import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
      name: 'Pizza Palace',
      admins: [{ name: 'John Admin', email: 'john@test.com' }],
      stores: [
        { id: '1', name: 'Downtown Store', totalRevenue: 1000 }
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

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders header and welcome message for admin user', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    expect(screen.getByText("Mama Ricci's kitchen")).toBeInTheDocument();
    expect(screen.getByText("Keep the dough rolling and the franchises signing up.")).toBeInTheDocument();
  });

  it('renders table headers correctly', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    const headers = ['Franchise', 'Franchisee', 'Store', 'Revenue', 'Action'];
    headers.forEach(header => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it('renders franchise and store data correctly', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza Palace')).toBeInTheDocument();
      expect(screen.getByText('John Admin')).toBeInTheDocument();
      expect(screen.getByText('Downtown Store')).toBeInTheDocument();
      expect(screen.getByText('1,000 ₿')).toBeInTheDocument();
    });
  });

  it('navigates to create franchise page when Add Franchise button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    const addButton = screen.getByText('Add Franchise');
    fireEvent.click(addButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard/create-franchise');
  });

  it('navigates to close franchise page when Close button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      const closeButtons = screen.getAllByText('Close');
      fireEvent.click(closeButtons[0]); // Franchise close button
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard/close-franchise', {
      state: { franchise: mockFranchises[0] }
    });
  });

  it('navigates to close store page when store Close button is clicked', async () => {
    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      const closeButtons = screen.getAllByText('Close');
      fireEvent.click(closeButtons[1]); // Store close button
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard/close-store', {
      state: { 
        franchise: mockFranchises[0],
        store: mockFranchises[0].stores[0]
      }
    });
  });

  it('shows NotFound for non-admin user', () => {
    const nonAdminUser = {
      ...mockAdminUser,
      roles: [{ role: Role.Diner }]
    };

    render(
      <BrowserRouter>
        <AdminDashboard user={nonAdminUser} />
      </BrowserRouter>
    );

    expect(screen.queryByText("Mama Ricci's kitchen")).not.toBeInTheDocument();
  });

  it('handles multiple franchises and stores', async () => {
    const multipleMockFranchises = [
      ...mockFranchises,
      {
        id: '2',
        name: 'Pizza Paradise',
        admins: [{ name: 'Jane Admin', email: 'jane@test.com' }],
        stores: [
          { id: '2', name: 'Mall Store', totalRevenue: 2000 },
          { id: '3', name: 'Airport Store', totalRevenue: 3000 }
        ]
      }
    ];

    vi.mocked(pizzaService.getFranchises).mockResolvedValue(multipleMockFranchises);

    render(
      <BrowserRouter>
        <AdminDashboard user={mockAdminUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pizza Paradise')).toBeInTheDocument();
      expect(screen.getByText('Jane Admin')).toBeInTheDocument();
      expect(screen.getByText('Mall Store')).toBeInTheDocument();
      expect(screen.getByText('Airport Store')).toBeInTheDocument();
      expect(screen.getByText('2,000 ₿')).toBeInTheDocument();
      expect(screen.getByText('3,000 ₿')).toBeInTheDocument();
    });
  });
});