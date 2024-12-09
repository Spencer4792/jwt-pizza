import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { act } from '@testing-library/react';
import Menu from '../../views/menu';
import { pizzaService } from '../../service/service';

// Mock the service
vi.mock('../../service/service', () => ({
  pizzaService: {
    getMenu: vi.fn(),
    getFranchises: vi.fn()
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
      state: null
    })
  };
});

describe('Menu', () => {
  const mockMenu = [
    {
      id: '1',
      title: 'Pepperoni',
      description: 'Classic pepperoni pizza',
      price: 100,
      image: 'pepperoni.jpg'
    },
    {
      id: '2',
      title: 'Margherita',
      description: 'Classic Italian pizza',
      price: 90,
      image: 'margherita.jpg'
    }
  ];

  const mockFranchises = [
    {
      id: 'franchise-1',
      name: 'Test Franchise',
      stores: [
        { id: 'store1', name: 'Store 1' },
        { id: 'store2', name: 'Store 2' }
      ]
    }
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    (pizzaService.getMenu as any).mockResolvedValue(mockMenu);
    (pizzaService.getFranchises as any).mockResolvedValue(mockFranchises);
  });

  it('renders menu items and store selection', async () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );

    // Wait for data to load and verify text content
    await waitFor(() => {
      expect(screen.getByText('Classic pepperoni pizza')).toBeInTheDocument();
      expect(screen.getByText('Classic Italian pizza')).toBeInTheDocument();
      const storeOptions = screen.getAllByRole('option');
      expect(storeOptions).toHaveLength(3); // Including the default "choose store" option
      expect(screen.getByText('Store 1')).toBeInTheDocument();
      expect(screen.getByText('Store 2')).toBeInTheDocument();
    });
  });

  it('allows pizza selection and updates cart', async () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );

    await waitFor(() => {
      const pizzaButton = screen.getByRole('button', { 
        name: /Image Description Pepperoni Classic pepperoni pizza/i 
      });
      fireEvent.click(pizzaButton);
      expect(screen.getByText('Selected pizzas: 1')).toBeInTheDocument();
    });
  });

  it('enables checkout when store selected and pizzas added', async () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Initially disabled
      const checkoutButton = screen.getByRole('button', { name: /Checkout/i });
      expect(checkoutButton).toBeDisabled();

      // Select store
      const storeSelect = screen.getByRole('combobox');
      fireEvent.change(storeSelect, { target: { value: 'store1' } });
      
      // Add pizza
      const pizzaButton = screen.getByRole('button', { 
        name: /Image Description Pepperoni Classic pepperoni pizza/i 
      });
      fireEvent.click(pizzaButton);

      // Should be enabled now
      expect(checkoutButton).toBeEnabled();
    });
  });

  it('navigates to payment on checkout', async () => {
    render(
      <BrowserRouter>
        <Menu />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Select store and add pizza
      const storeSelect = screen.getByRole('combobox');
      fireEvent.change(storeSelect, { target: { value: 'store1' } });
      
      const pizzaButton = screen.getByRole('button', { 
        name: /Image Description Pepperoni Classic pepperoni pizza/i 
      });
      fireEvent.click(pizzaButton);

      // Submit form
      const checkoutButton = screen.getByRole('button', { name: /Checkout/i });
      fireEvent.click(checkoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/payment', expect.objectContaining({
        state: expect.objectContaining({
          order: expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                menuId: '1',
                description: 'Pepperoni',
                price: 100
              })
            ])
          })
        })
      }));
    });
  });
});