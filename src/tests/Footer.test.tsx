import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Footer from '../app/footer';

describe('Footer', () => {
  const mockNavItems = [
    { title: 'About', to: '/about', display: ['footer'] },
    { title: 'Contact', to: '/contact', display: ['footer'] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch
    window.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ version: '1.0.0' }),
      })
    ) as unknown as typeof fetch;
  });

  it('renders footer navigation items', () => {
    render(
      <BrowserRouter>
        <Footer navItems={mockNavItems} />
      </BrowserRouter>
    );

    mockNavItems.forEach(item => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  it('displays version number', async () => {
    render(
      <BrowserRouter>
        <Footer navItems={mockNavItems} />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Version: 1.0.0/)).toBeInTheDocument();
  });
});