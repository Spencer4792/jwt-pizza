import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CloseFranchise from '../../views/closeFranchise';
import { pizzaService } from '../../service/service';
import { vi } from 'vitest';
import { act } from '@testing-library/react';

// Mock the service
vi.mock('../../service/service', () => ({
  pizzaService: {
    closeFranchise: vi.fn()
  }
}));

// Mock the breadcrumb hook with a complete mock implementation
vi.mock('../../hooks/appNavigation', () => ({
  useBreadcrumb: () => {
    return () => {};  // Return empty function
  }
}));

// Mock useLocation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useLocation: () => ({
      pathname: '/admin/franchise/close',
      state: {
        franchise: { name: 'Test Franchise', id: '1' }
      }
    })
  };
});

describe('CloseFranchise', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders close franchise confirmation', () => {
    render(
      <BrowserRouter>
        <CloseFranchise />
      </BrowserRouter>
    );

    expect(screen.getByText(/Are you sure you want to close the/)).toBeInTheDocument();
    expect(screen.getByText('Test Franchise')).toBeInTheDocument();
  });

  it('handles franchise closure', async () => {
    render(
      <BrowserRouter>
        <CloseFranchise />
      </BrowserRouter>
    );

    const closeButton = screen.getByText('Close');
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(pizzaService.closeFranchise).toHaveBeenCalledWith({
      name: 'Test Franchise',
      id: '1'
    });
  });
});