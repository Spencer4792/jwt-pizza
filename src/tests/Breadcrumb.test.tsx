import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Breadcrumb from '../components/breadcrumb';

describe('Breadcrumb', () => {
  it('renders home link', () => {
    render(
      <BrowserRouter>
        <Breadcrumb location="" />
      </BrowserRouter>
    );

    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('renders path segments correctly', () => {
    render(
      <BrowserRouter>
        <Breadcrumb location="menu/items/pizza" />
      </BrowserRouter>
    );

    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('menu')).toBeInTheDocument();
    expect(screen.getByText('items')).toBeInTheDocument();
    expect(screen.getByText('pizza')).toBeInTheDocument();
  });

  it('creates correct navigation links', () => {
    render(
      <BrowserRouter>
        <Breadcrumb location="menu/items" />
      </BrowserRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3); // home + 2 path segments
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveAttribute('href', '/menu');
    expect(links[2]).toHaveAttribute('href', '/menu/items');
  });
});