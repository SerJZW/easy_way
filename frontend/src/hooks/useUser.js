import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';

export const useUser = () => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get('/auth/me');
        console.log('[useUser] Auth OK:', res.data);
        setUser(res.data);
      } catch (err) {
        console.log('[useUser] Auth failed:', err.response?.data || err.message);
        setUser(null);
      }
    };
    loadUser();
  }, []);

  return user;
};
