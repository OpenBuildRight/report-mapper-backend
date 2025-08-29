import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNavigate } from 'react-router-dom';

export const useHeader = () => {
  const { user, signoutRedirect, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = (): void => {
    signoutRedirect();
    setShowUserDropdown(false);
  };

  const handleLogin = (): void => {
    navigate('/login');
  };

  const toggleUserDropdown = (): void => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials
  const getUserInitials = (): string => {
    if (!user) return 'U';
    
    // Try to get initials from name property
    if (user.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    
    // Fallback to email
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'U';
  };

  return {
    user,
    isAuthenticated,
    showUserDropdown,
    dropdownRef,
    handleLogout,
    handleLogin,
    toggleUserDropdown,
    getUserInitials
  };
};
