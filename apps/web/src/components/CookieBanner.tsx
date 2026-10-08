'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShow(true);
  }, []);

  if (!show) return null;

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-800 z-50 flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-zinc-400">
        We use privacy-friendly analytics and necessary cookies to ensure you get the best experience. 
        Read our <a href="/privacy" className="underline hover:text-turmeric">Privacy Policy</a> (Draft - Pending Legal Review).
      </p>
      <button 
        onClick={accept}
        className="whitespace-nowrap px-4 py-2 bg-turmeric text-black font-semibold rounded-full hover:bg-turmeric/90 transition-colors"
      >
        Accept
      </button>
    </div>
  );
}
