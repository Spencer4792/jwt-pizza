import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateStore from '../../views/createStore';
import { pizzaService } from '../../service/service';
import { vi } from 'vitest';
import { act } from '@testing-library/react';

// Mock the service and navigation
vi.mock('../../service/service', () => ({
  pizzaService: {
    createStore: vi.fn()
  }
}));

// Mock the breadcrumb hook
vi.mock('../../hooks/appNavigation', () => ({
  useBreadcrumb: () => vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: '/test-path',
      state: {
        franchise: { name: 'Test Franchise', id: '1' }
      }
    })
  };
});

describe('CreateStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create store form', () => {
    render(
      <BrowserRouter>
        <CreateStore />
      </BrowserRouter>
    );

    expect(screen.getByText('Create store')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('store name')).toBeInTheDocument();
  });

  it('handles store creation', async () => {
    render(
      <BrowserRouter>
        <CreateStore />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('store name');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Store' } });
    });

    const submitButton = screen.getByText('Create');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(pizzaService.createStore).toHaveBeenCalledWith(
      { name: 'Test Franchise', id: '1' },
      { id: '', name: 'Test Store' }
    );
  });

  it('handles cancel action', async () => {
    render(
      <BrowserRouter>
        <CreateStore />
      </BrowserRouter>
    );

    const cancelButton = screen.getByText('Cancel');
    await act(async () => {
      fireEvent.click(cancelButton);
    });
  });

  it('requires store name input', async () => {
    render(
      <BrowserRouter>
        <CreateStore />
      </BrowserRouter>
    );

    const submitButton = screen.getByText('Create');
    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(pizzaService.createStore).not.toHaveBeenCalled();
  });
});