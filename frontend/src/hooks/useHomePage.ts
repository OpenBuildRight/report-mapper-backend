import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

export const useHomePage = () => {
  const { isAuthenticated } = useAuth();

  // Check for pending actions when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      const pendingAction = localStorage.getItem('pendingAction');
      if (pendingAction) {
        try {
          const action = JSON.parse(pendingAction);
          // Handle any pending actions if needed in the future
          console.log('Pending action:', action);
        } catch (error) {
          console.error('Error parsing pending action:', error);
        }
        localStorage.removeItem('pendingAction');
      }
    }
  }, [isAuthenticated]);

  return {
    isAuthenticated
  };
};
