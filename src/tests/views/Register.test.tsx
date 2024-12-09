import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../views/register';
import { pizzaService } from '../../service/service';
import { vi } from 'vitest';
import { act } from '@testing-library/react';

// Update the mock to provide the function implementation
vi.mock('../../service/service', () => ({
  pizzaService: {
    register: vi.fn()
  }
}));

vi.mock('../../hooks/appNavigation', () => ({
  useBreadcrumb: () => vi.fn()
}));

describe('Register', () => {
  const mockSetUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up the mock implementation in beforeEach
    (pizzaService.register as any).mockImplementation(() => Promise.resolve({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      roles: []
    }));
  });

  it('renders registration form', () => {
    render(
      <BrowserRouter>
        <Register setUser={mockSetUser} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('handles successful registration', async () => {
    render(
      <BrowserRouter>
        <Register setUser={mockSetUser} />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('Full name');
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Register');

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });

    expect(pizzaService.register).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      'password123'
    );
    expect(mockSetUser).toHaveBeenCalled();
  });

  it('handles registration errors', async () => {
    // Override the mock for this specific test
    (pizzaService.register as any).mockImplementation(() =>
      Promise.reject({ message: 'Registration failed' })
    );
  
    render(
      <BrowserRouter>
        <Register setUser={mockSetUser} />
      </BrowserRouter>
    );
  
    const nameInput = screen.getByPlaceholderText('Full name');
    const emailInput = screen.getByPlaceholderText('Email address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByText('Register');
  
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });
  
    // Instead of looking for role="alert", look for the actual message text
    const errorElement = screen.getByText((content) => {
      // The error message is stringified JSON, so we need to check if it contains our message
      return content.includes('Registration failed');
    });
    expect(errorElement).toBeInTheDocument();
  });
});