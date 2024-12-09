import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateFranchise from '../../views/createFranchise';
import { pizzaService } from '../../service/service';
import { vi } from 'vitest';

// Mock the service and navigation
vi.mock('../../service/service', () => ({
  pizzaService: {
    createFranchise: vi.fn()
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

describe('CreateFranchise', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders create franchise form', () => {
    render(
      <BrowserRouter>
        <CreateFranchise />
      </BrowserRouter>
    );

    expect(screen.getByText('Create franchise')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('franchise name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('franchisee admin email')).toBeInTheDocument();
  });

  it('handles franchise creation', async () => {
    render(
      <BrowserRouter>
        <CreateFranchise />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('franchise name');
    const emailInput = screen.getByPlaceholderText('franchisee admin email');
    const createButton = screen.getByText('Create');

    fireEvent.change(nameInput, { target: { value: 'Test Franchise' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    expect(pizzaService.createFranchise).toHaveBeenCalledWith({
      id: '',
      name: 'Test Franchise',
      stores: [],
      admins: [{ email: 'test@example.com' }]
    });
  });

  it('handles cancel action', () => {
    render(
      <BrowserRouter>
        <CreateFranchise />
      </BrowserRouter>
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Check if navigation was triggered
    expect(mockNavigate).toHaveBeenCalled();
  });
});