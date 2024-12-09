import React from 'react';
import { render, screen } from '@testing-library/react';
import About from '../../views/about';
import { BrowserRouter } from 'react-router-dom';

describe('About', () => {
  it('renders about page content', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText('The secret sauce')).toBeInTheDocument();
    expect(screen.getByText(/At JWT Pizza, our amazing employees/)).toBeInTheDocument();
    expect(screen.getByText('Our employees')).toBeInTheDocument();
    expect(screen.getAllByAltText('Employee stock photo')).toHaveLength(4);
    
    // Check for employee names
    expect(screen.getByText('James')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('Anna')).toBeInTheDocument();
    expect(screen.getByText('Brian')).toBeInTheDocument();
  });
});