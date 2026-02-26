'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useIsAdmin(): boolean {
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsAdminUser(false);
      return;
    }

    const cacheKey = `mockmaster_is_admin_${user.id}`;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached === 'true') { setIsAdminUser(true); return; }
      if (cached === 'false') return;
    } catch {
      // sessionStorage unavailable
    }

    fetch('/api/admin/check')
      .then((res) => {
        const result = res.ok;
        try { sessionStorage.setItem(cacheKey, String(result)); } catch { /* ignore */ }
        setIsAdminUser(result);
      })
      .catch(() => {});
  }, [user]);

  return isAdminUser;
}
