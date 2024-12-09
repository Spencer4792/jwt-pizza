import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Header from '../app/header';
import { Role, User } from '../service/pizzaService';

describe('Header', () => {
  const mockNavItems = [
    { 
      title: 'Home', 
      to: '/', 
      display: ['nav'],
      constraints: [] as (() => boolean)[]
    },
    { 
      title: 'Menu', 
      to: '/menu', 
      display: ['nav'],
      constraints: [] as (() => boolean)[]
    }
  ];

  it('renders logo and navigation', () => {
    render(
      <BrowserRouter>
        <Header user={null} navItems={mockNavItems} />
      </BrowserRouter>
    );

    expect(screen.getByText('JWT Pizza')).toBeInTheDocument();
    mockNavItems.forEach(item => {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    });
  });

  it('shows user initials when logged in', () => {
    const mockUser: User = {
      name: 'John Doe',
      email: 'john@example.com',
      id: '1',
      password: 'hashedpassword',
      roles: [{ role: Role.Diner }]
    };

    render(
      <BrowserRouter>
        <Header user={mockUser} navItems={mockNavItems} />
      </BrowserRouter>
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});