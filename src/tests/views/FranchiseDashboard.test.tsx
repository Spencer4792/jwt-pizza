import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FranchiseDashboard from '../../views/franchiseDashboard';
import { pizzaService } from '../../service/service';
import { vi } from 'vitest';

// Mock the service
vi.mock('../../service/service', () => ({
  pizzaService: {
    getFranchise: vi.fn()
  }
}));

// Mock the breadcrumb hook
vi.mock('../../hooks/appNavigation', () => ({
  useBreadcrumb: () => {
    return () => {};
  }
}));

// Mock useNavigate and useLocation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/franchise-dashboard',
      state: {}
    })
  };
});

describe('FranchiseDashboard', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    password: 'testpass123',
    roles: []
  };

  const mockFranchise = {
    id: '1',
    name: 'Test Franchise',
    stores: [
      { id: '1', name: 'Store 1', totalRevenue: 1000 },
      { id: '2', name: 'Store 2', totalRevenue: 2000 }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pizzaService.getFranchise as any).mockResolvedValue([mockFranchise]);
  });

  it('renders franchise dashboard with stores', async () => {
    render(
      <BrowserRouter>
        <FranchiseDashboard user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockFranchise.name)).toBeInTheDocument();
      expect(screen.getByText('Store 1')).toBeInTheDocument();
      expect(screen.getByText('Store 2')).toBeInTheDocument();
      expect(screen.getByText('1,000 ₿')).toBeInTheDocument();
      expect(screen.getByText('2,000 ₿')).toBeInTheDocument();
    });
  });

  it('navigates to create store page', async () => {
    render(
      <BrowserRouter>
        <FranchiseDashboard user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      const createButton = screen.getByText('Create store');
      fireEvent.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/franchise-dashboard/create-store', 
        expect.objectContaining({ state: { franchise: mockFranchise } }));
    });
  });

  it('renders why franchise section when no franchise exists', async () => {
    (pizzaService.getFranchise as any).mockResolvedValue([]);
    
    render(
      <BrowserRouter>
        <FranchiseDashboard user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('So you want a piece of the pie?')).toBeInTheDocument();
      expect(screen.getByText(/Now is the time to get in on the JWT Pizza tsunami/)).toBeInTheDocument();
    });
  });

  it('navigates to close store page', async () => {
    render(
      <BrowserRouter>
        <FranchiseDashboard user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Find all buttons and click the one with "Close" text
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(button => button.textContent?.includes('Close'));
      if (!closeButton) throw new Error('Close button not found');
      
      fireEvent.click(closeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/franchise-dashboard/close-store', 
        expect.objectContaining({ 
          state: { 
            franchise: mockFranchise, 
            store: mockFranchise.stores[0] 
          } 
        }));
    });
  });
});