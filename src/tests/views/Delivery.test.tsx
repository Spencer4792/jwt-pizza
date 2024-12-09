import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { act } from '@testing-library/react';
import Delivery from '../../views/delivery';
import { pizzaService } from '../../service/service';

// Mock preline
vi.mock('preline', () => ({
  HSOverlay: {
    open: vi.fn()
  }
}));

// Mock the service
vi.mock('../../service/service', () => ({
  pizzaService: {
    verifyOrder: vi.fn()
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
      pathname: '/delivery',
      state: {
        order: {
          id: 'order-1',
          items: [{ price: 100 }, { price: 200 }]
        },
        jwt: 'mock.jwt.token'
      }
    })
  };
});

describe('Delivery', () => {
  const mockJwtPayload = {
    message: 'valid',
    payload: { orderId: 'order-1' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (pizzaService.verifyOrder as any).mockResolvedValue(mockJwtPayload);
  });

  it('renders delivery page with order details', () => {
    render(
      <BrowserRouter>
        <Delivery />
      </BrowserRouter>
    );

    expect(screen.getByText('Here is your JWT Pizza!')).toBeInTheDocument();
    expect(screen.getByText('order-1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // pie count
    expect(screen.getByText('300 ₿')).toBeInTheDocument();
  });

  it('verifies valid JWT token', async () => {
    render(
      <BrowserRouter>
        <Delivery />
      </BrowserRouter>
    );

    const verifyButton = screen.getByRole('button', { name: /Verify/ });
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    expect(pizzaService.verifyOrder).toHaveBeenCalledWith('mock.jwt.token');
  });

  it('handles invalid JWT token', async () => {
    const errorPayload = {
      message: 'invalid',
      payload: { error: 'invalid JWT. Looks like you have a bad pizza!' }
    };
    (pizzaService.verifyOrder as any).mockRejectedValue(errorPayload);

    render(
      <BrowserRouter>
        <Delivery />
      </BrowserRouter>
    );

    const verifyButton = screen.getByRole('button', { name: /Verify/ });
    await act(async () => {
      fireEvent.click(verifyButton);
    });

    // We can't test the modal content since it's managed by preline
    expect(pizzaService.verifyOrder).toHaveBeenCalledWith('mock.jwt.token');
  });

  it('navigates to menu on order more', () => {
    render(
      <BrowserRouter>
        <Delivery />
      </BrowserRouter>
    );

    const orderMoreButton = screen.getByRole('button', { name: /Order more/ });
    fireEvent.click(orderMoreButton);
    expect(mockNavigate).toHaveBeenCalledWith('/menu');
  });
});