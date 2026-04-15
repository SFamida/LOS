'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <h2>Something went wrong</h2>
      <button className="btn btn-primary mt-3" onClick={reset}>Try again</button>
    </div>
  );
}
