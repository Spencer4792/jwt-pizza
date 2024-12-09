import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Payment from '../../views/payment';
import { pizzaService } from '../../service/service';
import { vi } from 'vitest';
import { act } from '@testing-library/react';
import { User, Role, Order } from '../../service/pizzaService';

// Mock the service
vi.mock('../../service/service', () => ({
  pizzaService: {
    getUser: vi.fn(),
    order: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/payment',
      state: {
        order: mockOrder
      }
    })
  };
});

const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  roles: [{ role: Role.Diner }]
};

const mockOrder: Order = {
  id: '1',
  franchiseId: '1',
  storeId: '1',
  date: new Date().toISOString(),
  items: [
    { menuId: '1', description: 'Pizza 1', price: 10 },
    { menuId: '2', description: 'Pizza 2', price: 15 }
  ]
};

describe('Payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(pizzaService.getUser).mockResolvedValue(mockUser);
  });

  it('renders payment page with order details', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <Payment />
        </BrowserRouter>
      );
    });

    expect(screen.getByText('Pizza 1')).toBeInTheDocument();
    expect(screen.getByText('Pizza 2')).toBeInTheDocument();
    expect(screen.getByText('25 ₿')).toBeInTheDocument();
  });

  it('processes payment successfully', async () => {
    vi.mocked(pizzaService.order).mockResolvedValue({
      order: mockOrder,
      jwt: 'test-jwt'
    });

    await act(async () => {
      render(
        <BrowserRouter>
          <Payment />
        </BrowserRouter>
      );
    });

    const payButton = screen.getByText('Pay now');
    await act(async () => {
      fireEvent.click(payButton);
    });

    expect(pizzaService.order).toHaveBeenCalledWith(mockOrder);
    expect(mockNavigate).toHaveBeenCalledWith('/delivery', expect.any(Object));
  });

  it('handles payment errors', async () => {
    const errorMessage = 'Payment failed';
    vi.mocked(pizzaService.order).mockRejectedValue({ message: errorMessage });

    await act(async () => {
      render(
        <BrowserRouter>
          <Payment />
        </BrowserRouter>
      );
    });

    const payButton = screen.getByText('Pay now');
    await act(async () => {
      fireEvent.click(payButton);
    });

    // Using a more flexible query that looks for text content containing the error message
    const errorElement = await screen.findByText((content) => {
      return content.includes('⚠️') && content.includes(errorMessage);
    });
    expect(errorElement).toBeInTheDocument();
  });

  it('redirects to login if user not authenticated', async () => {
    vi.mocked(pizzaService.getUser).mockResolvedValue(null);

    await act(async () => {
      render(
        <BrowserRouter>
          <Payment />
        </BrowserRouter>
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/payment/login', expect.any(Object));
  });
});