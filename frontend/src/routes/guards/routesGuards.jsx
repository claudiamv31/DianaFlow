import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { checkUser } from '../../database/authService';
import LoadingSpinner from '../../components/LoadingSpinner';

export function PrivateRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner
        layout="screen"
        size="lg"
        label="Loading DianaFlow..."
        showLabel
      />
    );
  }

  return user ? children : <Navigate to="/login" />;
}

export function PublicRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = checkUser((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner
        layout="screen"
        size="lg"
        label="Loading DianaFlow..."
        showLabel
      />
    );
  }

  return !user ? children : <Navigate to="/" />;
}
