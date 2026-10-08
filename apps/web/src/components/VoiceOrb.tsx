"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Sphere } from "ogl";

const vertex = `
  attribute vec3 position;
  attribute vec3 normal;
  
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uAudioLevels;

  varying vec3 vNormal;

  // Simple simplex noise function to displace vertices
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vNormal = normal;
    
    // Displace by noise and audio
    float noise = snoise(position * 2.0 + uTime * 0.5);
    vec3 displaced = position + normal * (noise * (0.1 + uAudioLevels * 0.5));
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragment = `
  precision highp float;
  varying vec3 vNormal;
  uniform float uAudioLevels;
  uniform vec3 uStateColor;

  void main() {
    vec3 darkColor = vec3(0.05, 0.05, 0.08); // Dark ink
    
    float intensity = dot(vNormal, vec3(0.0, 0.0, 1.0));
    intensity = smoothstep(0.0, 1.0, intensity);
    
    // Add brightness based on audio
    vec3 color = mix(darkColor, uStateColor, intensity + uAudioLevels * 0.3);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export type OrbState = 'idle' | 'connecting' | 'listening' | 'user-speaking' | 'thinking' | 'agent-speaking' | 'error';

interface VoiceOrbProps {
  state?: OrbState;
  audioLevel?: number; // 0 to 1
}

export function VoiceOrb({ state = 'idle', audioLevel = 0 }: VoiceOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ dpr: 2, alpha: true });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 5;

    const scene = new Transform();

    const geometry = new Sphere(gl, {
      radius: 1.5,
      widthSegments: 64,
      heightSegments: 64,
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uAudioLevels: { value: 0 },
        uStateColor: { value: [0.96, 0.62, 0.04] }, // Turmeric default
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    let animationId: number;

    function resize() {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      renderer.setSize(clientWidth, clientHeight);
      camera.perspective({ aspect: clientWidth / clientHeight });
    }
    window.addEventListener("resize", resize, false);
    resize();

    // Map state to colors (RGB 0-1)
    const stateColors: Record<OrbState, [number, number, number]> = {
      'idle': [0.5, 0.5, 0.5], // Gray
      'connecting': [0.8, 0.8, 0.8], 
      'listening': [0.1, 0.8, 0.9], // Cyan-ish
      'user-speaking': [0.1, 0.9, 0.4], // Green
      'thinking': [0.7, 0.2, 0.9], // Purple
      'agent-speaking': [0.96, 0.62, 0.04], // Turmeric
      'error': [0.9, 0.1, 0.1], // Red
    };

    function update(t: number) {
      animationId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      
      let targetLevel = audioLevel;
      
      // Automatic animation for thinking state
      if (state === 'thinking') {
        targetLevel = Math.sin(t * 0.005) * 0.5 + 0.5;
      } else if (state === 'idle' || state === 'connecting' || state === 'error') {
        targetLevel = Math.sin(t * 0.002) * 0.1;
      }

      // Smooth damp the audio level
      program.uniforms.uAudioLevels.value += (targetLevel - program.uniforms.uAudioLevels.value) * 0.15;
      
      // Smooth color transition
      const targetColor = stateColors[state] || stateColors['idle'];
      const curColor = program.uniforms.uStateColor.value;
      curColor[0] += (targetColor[0] - curColor[0]) * 0.05;
      curColor[1] += (targetColor[1] - curColor[1]) * 0.05;
      curColor[2] += (targetColor[2] - curColor[2]) * 0.05;

      mesh.rotation.y += 0.005;
      mesh.rotation.x += 0.002;

      renderer.render({ scene, camera });
    }
    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      if (containerRef.current && gl.canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, [state, audioLevel]);

  return <div ref={containerRef} className="w-full h-full relative" />;
}
