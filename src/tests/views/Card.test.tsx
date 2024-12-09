import React from 'react';
import { render, screen } from '@testing-library/react';
import Card from '../../components/card';

describe('Card', () => {
  const mockProps = {
    title: 'Test Pizza',
    description: 'A delicious test pizza',
    image: '/test-pizza.jpg'
  };

  it('renders card with provided props', () => {
    render(<Card {...mockProps} />);

    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    expect(screen.getByAltText('Image Description')).toHaveAttribute('src', mockProps.image);
  });

  it('renders with correct styles', () => {
    render(<Card {...mockProps} />);
    
    const image = screen.getByAltText('Image Description');
    expect(image).toHaveClass('object-cover');
    // Check parent container
    const container = screen.getByRole('link');
    expect(container).toHaveClass('flex', 'flex-col', 'group');
  });
});