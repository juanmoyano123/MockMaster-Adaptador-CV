'use client';

import { useState, useEffect } from 'react';

export function useIsAdmin(): boolean {
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('mockmaster_is_admin');
      if (cached === 'true') { setIsAdminUser(true); return; }
      if (cached === 'false') return;
    } catch {
      // sessionStorage unavailable
    }

    fetch('/api/admin/check')
      .then((res) => {
        const result = res.ok;
        try { sessionStorage.setItem('mockmaster_is_admin', String(result)); } catch { /* ignore */ }
        setIsAdminUser(result);
      })
      .catch(() => {});
  }, []);

  return isAdminUser;
}
