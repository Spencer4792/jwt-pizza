import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../app/app';
import { pizzaService } from '../service/service';

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock fetch
window.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ version: '1.0.0' }),
  })
) as unknown as typeof fetch;

// Mock the pizza service
vi.mock('../service/service', () => ({
  pizzaService: {
    getUser: vi.fn()
  }
}));

// Mock the preline HSStaticMethods
vi.mock('preline/preline', () => ({
  default: {},
}));

// Mock window.HSStaticMethods
window.HSStaticMethods = {
  autoInit: vi.fn()
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders main layout components', async () => {
    // Mock the getUser response
    vi.mocked(pizzaService.getUser).mockResolvedValue(null);

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Check for main structural elements
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});