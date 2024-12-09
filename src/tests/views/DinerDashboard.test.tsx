import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import DinerDashboard from '../../views/dinerDashboard';
import { pizzaService } from '../../service/service';
import { Role } from '../../service/pizzaService';

// Mock the service
vi.mock('../../service/service', () => ({
  pizzaService: {
    getOrders: vi.fn()
  }
}));

// Mock the breadcrumb hook
vi.mock('../../hooks/appNavigation', () => ({
  useBreadcrumb: () => {
    return () => {};
  }
}));

describe('DinerDashboard', () => {
  const mockUser = {
    id: '1',
    name: 'Test Diner',
    email: 'diner@test.com',
    password: 'testpass123',
    roles: [
      { role: Role.Diner },
      { role: Role.Franchisee, objectId: 'franchise-1' }
    ]
  };

  const mockOrders = {
    orders: [
      {
        id: 'order-1',
        items: [{ price: 100 }, { price: 200 }],
        date: new Date('2024-01-01')
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pizzaService.getOrders as any).mockResolvedValue(mockOrders);
  });

  it('renders diner dashboard with orders', async () => {
    render(
      <BrowserRouter>
        <DinerDashboard user={mockUser} />
      </BrowserRouter>
    );

    // Basic info
    await waitFor(() => {
      expect(screen.getByText('Your pizza kitchen')).toBeInTheDocument();
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    // Check order data after the async call resolves
    await waitFor(() => {
      // Order id
      expect(screen.getByText('order-1')).toBeInTheDocument();

      // Check total amount - needs to be calculated from the items
      const total = mockOrders.orders[0].items.reduce((sum, item) => sum + item.price, 0);
      expect(screen.getByText(`${total} ₿`)).toBeInTheDocument();
    });
  });

  it('displays correct role formatting', async () => {
    render(
      <BrowserRouter>
        <DinerDashboard user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Look for the role label first
      const roleLabel = screen.getByText('role:', { exact: true });
      // Then find the roles container which should be the next grid column
      const rolesContainer = roleLabel.nextElementSibling;
      
      // Assert that both roles are displayed correctly
      expect(rolesContainer?.textContent).toContain('diner');
      expect(rolesContainer?.textContent).toContain('Franchisee on franchise-1');
    });
  });

  it('shows message when no orders exist', async () => {
    (pizzaService.getOrders as any).mockResolvedValue({ orders: [] });
    
    render(
      <BrowserRouter>
        <DinerDashboard user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/How have you lived this long without having a pizza?/)).toBeInTheDocument();
      expect(screen.getByText('Buy one')).toBeInTheDocument();
    });
  });

  it('renders NotFound component when no user provided', () => {
    render(
      <BrowserRouter>
        <DinerDashboard user={null} />
      </BrowserRouter>
    );

    expect(screen.getByText('Oops')).toBeInTheDocument();
    expect(screen.getByText(/It looks like we have dropped a pizza on the floor/)).toBeInTheDocument();
  });
});