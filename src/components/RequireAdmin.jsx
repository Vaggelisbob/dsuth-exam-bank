import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const RequireAdmin = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub = null;
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (user && user.id === ADMIN_UID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/');
      }
      setLoading(false);
    });
    unsub = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user && user.id === ADMIN_UID) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        navigate('/');
      }
      setLoading(false);
    });
    return () => {
      unsub?.data?.subscription?.unsubscribe();
    };
  }, [navigate]);

  if (loading) return null;
  if (!isAdmin) return null;
  return children;
};

export default RequireAdmin; 