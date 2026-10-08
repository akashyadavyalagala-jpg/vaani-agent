'use client';

import React, { useEffect, useRef } from 'react';

interface VoiceOrbCanvasProps {
  state: 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';
  audioLevelRef: React.MutableRefObject<number>;
}

import { useTheme } from 'next-themes';

export function VoiceOrbCanvas({ state, audioLevelRef }: VoiceOrbCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let baseRadius = 0;
    let currentRadius = 0;

    const numPoints = 64;
    // Pre-allocate Float32Arrays for zero allocations per frame
    const pointsAngle = new Float32Array(numPoints);
    const pointsOffset = new Float32Array(numPoints);
    const pointsTargetOffset = new Float32Array(numPoints);
    
    for (let i = 0; i < numPoints; i++) {
      pointsAngle[i] = (i / numPoints) * Math.PI * 2;
    }

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR at 2 for performance
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      baseRadius = Math.min(width, height) * 0.25;
      currentRadius = baseRadius;
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const isLight = resolvedTheme === 'light';
    
    // Color definitions per state (matching Theme)
    const colors = {
      idle: isLight ? 'rgba(200, 200, 200, 1)' : 'rgba(51, 51, 51, 1)',
      listen: isLight ? 'rgba(0, 180, 150, 1)' : 'rgba(0, 245, 212, 1)',
      think: isLight ? 'rgba(100, 30, 150, 1)' : 'rgba(123, 44, 191, 1)',
      speak: isLight ? 'rgba(230, 120, 0, 1)' : 'rgba(255, 158, 0, 1)',
    };

    const render = () => {
      timeRef.current += 0.02;
      ctx.clearRect(0, 0, width, height);

      let targetRad = baseRadius;
      let noiseIntensity = 5;
      let rotationSpeed = 0.5;
      let colorKey: keyof typeof colors = 'idle';

      switch (state) {
        case 'listening':
          targetRad = baseRadius * 0.9 + (audioLevelRef.current * 10);
          noiseIntensity = 10 + (audioLevelRef.current * 30);
          colorKey = 'listen';
          break;
        case 'thinking':
          targetRad = baseRadius * 0.8;
          noiseIntensity = 15;
          rotationSpeed = 3.0;
          colorKey = 'think';
          break;
        case 'speaking':
          targetRad = baseRadius * 1.2 + (audioLevelRef.current * 40);
          noiseIntensity = 20 + (audioLevelRef.current * 50);
          colorKey = 'speak';
          break;
        case 'error':
        case 'connecting':
        case 'idle':
          targetRad = baseRadius * 0.8;
          noiseIntensity = 2;
          colorKey = 'idle';
          break;
      }

      currentRadius += (targetRad - currentRadius) * 0.1;
      const cx = width / 2;
      const cy = height / 2;

      // Glow done with layered gradients instead of CSS filter blur
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, currentRadius * 1.5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, colors[colorKey]);
      grad.addColorStop(1, colors[colorKey].replace('1)', '0)')); // Fade to transparent version of same color

      ctx.beginPath();
      
      const renderPointsX = new Float32Array(numPoints);
      const renderPointsY = new Float32Array(numPoints);

      for (let i = 0; i < numPoints; i++) {
        const angle = pointsAngle[i];
        const noise = Math.sin(angle * 3 + timeRef.current * rotationSpeed) * 
                      Math.cos(angle * 2 - timeRef.current) * noiseIntensity;
        
        let audioSpike = 0;
        if ((state === 'speaking' || state === 'listening') && audioLevelRef.current > 0) {
          audioSpike = Math.pow(Math.sin(angle * 8), 2) * audioLevelRef.current * 20;
        }

        pointsTargetOffset[i] = noise + audioSpike;
        pointsOffset[i] += (pointsTargetOffset[i] - pointsOffset[i]) * 0.2;
        
        const r = currentRadius + pointsOffset[i];
        const theta = angle + (state === 'thinking' ? timeRef.current * 2 : timeRef.current * 0.2);
        
        renderPointsX[i] = cx + Math.cos(theta) * r;
        renderPointsY[i] = cy + Math.sin(theta) * r;
      }

      // Start at midpoint of 0 and 1 to prevent seam kinks
      const startX = (renderPointsX[0] + renderPointsX[1]) / 2;
      const startY = (renderPointsY[0] + renderPointsY[1]) / 2;
      ctx.moveTo(startX, startY);
      
      for (let i = 1; i < numPoints; i++) {
        const nextI = (i + 1) % numPoints;
        const xc = (renderPointsX[i] + renderPointsX[nextI]) / 2;
        const yc = (renderPointsY[i] + renderPointsY[nextI]) / 2;
        ctx.quadraticCurveTo(renderPointsX[i], renderPointsY[i], xc, yc);
      }
      
      // Close the seam smoothly back to startX/startY
      ctx.quadraticCurveTo(renderPointsX[0], renderPointsY[0], startX, startY);

      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle inner stroke
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(255,255,255,${state === 'thinking' ? 0.8 : 0.2})`;
      ctx.stroke();

      rafRef.current = requestAnimationFrame(render);
    };

    // Only run when visible
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(rafRef.current);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      io.disconnect();
    };
  }, [state, resolvedTheme]);

  // Handle CSS filters via classes rather than inline style string updates to prevent reflows
  const filterClass = state === 'thinking' 
    ? 'blur-sm contrast-125' 
    : state === 'speaking' 
      ? 'blur-[1px] drop-shadow-xl' 
      : 'blur-[1px]';

  return (
    <div 
      className="group relative w-full max-w-[400px] aspect-square flex items-center justify-center cursor-none"
      data-cursor="orb"
    >
      <canvas 
        ref={canvasRef} 
        className={`w-full h-full transition-all duration-700 ease-out ${filterClass}`} 
      />
      <div className="absolute -bottom-10 w-full text-center font-mono text-xs text-zinc-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
        {state}
      </div>
    </div>
  );
}
