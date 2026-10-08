'use client'
 
import { useEffect } from 'react'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])
 
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-zinc-100 p-8 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <h2 className="text-4xl font-bold tracking-tighter mb-4">Something went wrong!</h2>
      <p className="text-xl text-zinc-400 mb-8 max-w-md">
        The system experienced a fault. Our engineers have been notified.
      </p>
      
      <button
        onClick={() => reset()}
        className="px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
