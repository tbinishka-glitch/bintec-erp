'use client';

import { useEffect, useState } from 'react';

/**
 * ClientOnly wrapper to ensure children are only rendered on the client side.
 * This prevents hydration mismatches caused by browser extensions or dynamic elements.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}
