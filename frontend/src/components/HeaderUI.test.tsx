import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeaderUI from './HeaderUI';
import { AuthUser } from '../auth/useAuth';

// Wrapper component to provide router context
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('HeaderUI', () => {
  const defaultProps = {
    user: null as AuthUser | null,
    isAuthenticated: false,
    showUserDropdown: false,
    dropdownRef: { current: null } as React.RefObject<HTMLDivElement | null>,
    onLogout: jest.fn() as jest.MockedFunction<() => void>,
    onLogin: jest.fn() as jest.MockedFunction<() => void>,
    onToggleUserDropdown: jest.fn() as jest.MockedFunction<() => void>,
    getUserInitials: jest.fn().mockReturnValue('U') as jest.MockedFunction<() => string>
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
      user: { name: 'John Doe', email: 'john@example.com' } as AuthUser // Updated user structure
    };
    renderWithRouter(<HeaderUI {...props} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('should show user dropdown when clicked', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true,
      user: { name: 'John Doe', email: 'john@example.com' } as AuthUser,
      showUserDropdown: true
    };
    renderWithRouter(<HeaderUI {...props} />);
    
    const userButtons = screen.getAllByRole('button');
    const userButton = userButtons[0]; // Get the first button (user button)
    fireEvent.click(userButton);
    expect(defaultProps.onToggleUserDropdown).toHaveBeenCalled();
  });

  test('should show dropdown when showUserDropdown is true', () => {
    const props = {
      ...defaultProps,
      isAuthenticated: true,
      showUserDropdown: true,
      user: { name: 'John Doe', email: 'john@example.com' } as AuthUser
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
      user: { name: 'John Doe', email: 'john@example.com' } as AuthUser
    };
    renderWithRouter(<HeaderUI {...props} />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(defaultProps.onLogout).toHaveBeenCalled();
  });
});
