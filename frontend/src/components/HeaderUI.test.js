import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeaderUI from './HeaderUI';

// Wrapper component to provide router context
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HeaderUI', () => {
  const defaultProps = {
    user: null,
    isAuthenticated: false,
    showUserDropdown: false,
    dropdownRef: { current: null },
    onLogout: jest.fn(),
    onLogin: jest.fn(),
    onToggleUserDropdown: jest.fn(),
    getUserInitials: jest.fn().mockReturnValue('U')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render header title', () => {
    renderWithRouter(<HeaderUI {...defaultProps} />);
    expect(screen.getByText('Report Mapper')).toBeInTheDocument();
  });

  test('should render navigation links', () => {
    renderWithRouter(<HeaderUI {...defaultProps} />);
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Create Observation')).toBeInTheDocument();
  });

  test('should show login button when not authenticated', () => {
    renderWithRouter(<HeaderUI {...defaultProps} />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('should call onLogin when login button is clicked', () => {
    renderWithRouter(<HeaderUI {...defaultProps} />);
    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);
    expect(defaultProps.onLogin).toHaveBeenCalled();
  });

  test('should show user button when authenticated', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true,
      user: { name: 'John Doe', email: 'john@example.com' }
    };
    renderWithRouter(<HeaderUI {...props} />);
    expect(screen.getByRole('button', { class: 'user-button' })).toBeInTheDocument();
  });

  test('should call onToggleUserDropdown when user button is clicked', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true,
      user: { name: 'John Doe', email: 'john@example.com' }
    };
    renderWithRouter(<HeaderUI {...props} />);
    const userButton = screen.getByRole('button', { class: 'user-button' });
    fireEvent.click(userButton);
    expect(defaultProps.onToggleUserDropdown).toHaveBeenCalled();
  });

  test('should show dropdown when showUserDropdown is true', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true,
      showUserDropdown: true,
      user: { name: 'John Doe', email: 'john@example.com' }
    };
    renderWithRouter(<HeaderUI {...props} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('should call onLogout when logout button is clicked', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true,
      showUserDropdown: true,
      user: { name: 'John Doe', email: 'john@example.com' }
    };
    renderWithRouter(<HeaderUI {...props} />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });

  test('should display user name and email in dropdown', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true,
      showUserDropdown: true,
      user: { name: 'Jane Smith', email: 'jane@example.com' }
    };
    renderWithRouter(<HeaderUI {...props} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });
});
