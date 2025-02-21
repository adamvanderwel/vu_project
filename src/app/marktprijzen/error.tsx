'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="flex items-center gap-2 text-red-500 mb-4">
        <AlertTriangle className="w-6 h-6" />
        <h2 className="text-xl font-semibold">Er is iets misgegaan</h2>
      </div>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        Er is een fout opgetreden bij het laden van de marktprijzen. 
        Probeer de pagina opnieuw te laden of neem contact op met support als het probleem aanhoudt.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#2F3744] text-white rounded hover:bg-[#3A4454]"
      >
        Probeer opnieuw
      </button>
    </div>
  );
} 