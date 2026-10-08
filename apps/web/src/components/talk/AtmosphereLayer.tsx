'use client';

import React from 'react';

export function AtmosphereLayer() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-black transition-colors duration-500">
      
      {/* Central Red Glow from Error Page Aesthetic */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] pointer-events-none"
        style={{
          background: 'rgba(239, 68, 68, 0.08)', /* red-500 equivalent */
          animation: 'pulse 10s infinite alternate ease-in-out',
          willChange: 'transform, opacity'
        }}
      />
      
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
      `}} />
    </div>
  );
}
