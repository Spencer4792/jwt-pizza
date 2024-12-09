import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../views/login';
import { pizzaService } from '../../service/service';
import { vi } from 'vitest';
import { act } from '@testing-library/react';
import { User, Role } from '../../service/pizzaService';

// Mock the service
vi.mock('../../service/service', () => ({
  pizzaService: {
    login: vi.fn()
  }
}));

// Mock the breadcrumb hook
vi.mock('../../hooks/appNavigation', () => ({
  useBreadcrumb: () => vi.fn()
}));

describe('Login', () => {
  const mockSetUser = vi.fn();

  const mockUser: User = {
    id: '1',
    name: 'Test',
    email: 'test@example.com',
    password: 'hashedpassword', // Added password
    roles: [{ role: Role.Diner }] // Added proper role type
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login setUser={mockSetUser} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  // Rest of the test cases...
});