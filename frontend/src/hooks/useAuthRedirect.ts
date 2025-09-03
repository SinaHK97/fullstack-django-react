import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/features/auth/authSlice';
import type { RootState } from '@/app/store';

export const useAuthRedirect = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handle401Error = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return {
    handleLogout,
    handle401Error,
    isAuthenticated,
  };
};
