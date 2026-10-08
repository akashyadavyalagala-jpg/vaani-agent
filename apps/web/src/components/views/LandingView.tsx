"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { VoiceOrb } from "../VoiceOrb";
import { Preloader } from "../Preloader";
import { SmoothScroll } from "../SmoothScroll";
import { ScrollProgress } from "../ScrollProgress";
import { Reveal } from "../../design/primitives/Reveal";
import { Button } from "../../design/primitives/Button";
import { Chip } from "../../design/primitives/Chip";
import { Card } from "../../design/primitives/Card";
import { Marquee } from "../../design/primitives/Marquee";
import { Mic, Play, Activity, Globe, Shield, Calendar, Layers } from "lucide-react";
import { useUIStore } from "../../store/uiStore";

export default function LandingView() {
  const [mounted, setMounted] = useState(false);
  const setMainView = useUIStore((s) => s.setMainView);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  if (!mounted) return null;

  return (
    <>
      <div className="film-grain" />
      <ScrollProgress />
      <Preloader />
      
      <SmoothScroll>
        <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-hidden selection:bg-[var(--turmeric)] selection:text-[var(--ink)]">
          {/* NAV */}
          <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 mix-blend-difference text-white">
            <a 
              href="#"
              onClick={(e) => { e.preventDefault(); setMainView('dashboard'); }}
              className="group font-serif text-2xl font-bold tracking-tight transition-colors hover:text-red-500 cursor-pointer"
            >
              వాణి.
            </a>
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium uppercase tracking-widest hidden md:block">వాణి AI</span>
              <Button size="sm" variant="outline" className="border-white/20 hover:border-white/50 bg-transparent text-white" onClick={() => setMainView('dashboard')}>వాణి Studio</Button>
            </div>
          </nav>

          {/* 1. HERO */}
          <section className="relative h-screen flex flex-col items-center justify-center pt-20 px-6">
            <motion.div style={{ opacity: heroOpacity, y: heroY }} className="z-10 text-center flex flex-col items-center max-w-5xl mx-auto w-full">
              <Chip variant="warning" className="mb-8">
                <span className="w-2 h-2 rounded-full bg-[var(--turmeric)] mr-2 animate-pulse" />
                Live: 1.1s E2E Latency
              </Chip>
              
              <h1 className="text-[var(--font-size-hero)] font-serif leading-[1.1] tracking-tight text-[var(--foreground)] mb-6" lang="te">
                <Reveal text="మాట్లాడే AI," splitBy="word" delay={2} />
                <br />
                <Reveal text="అర్థం చేసుకునే AI." splitBy="word" delay={2.4} />
              </h1>
              
              <div className="text-xl md:text-2xl text-[var(--muted)] max-w-3xl mb-12 font-sans font-light flex flex-wrap justify-center gap-x-2 leading-relaxed" lang="te">
                <Reveal text="వాణి" delay={2.8} className="font-bold text-[var(--turmeric)]" />
                <Reveal text="అనేది కేవలం 1.5 సెకన్లలోపు విని, అర్థం చేసుకుని, తక్షణమే పనిచేసే ఒక అత్యాధునిక రియల్-టైమ్ తెలుగు వాయిస్ ఏజెంట్." delay={2.9} />
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3.2, duration: 0.8, type: "spring" }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                <Button size="lg" className="group" onClick={() => setMainView('talk')}>
                  <Mic className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Talk to వాణి
                </Button>
                <span className="text-xs text-[var(--muted)] ml-2">Requires mic permission</span>
              </motion.div>
            </motion.div>
            
            {/* OGL Voice Orb Background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 mix-blend-screen pointer-events-none mt-32 md:mt-0">
              <div className="w-[600px] h-[600px] md:w-[800px] md:h-[800px]">
                <VoiceOrb state="idle" />
              </div>
            </div>
          </section>

          {/* 2. LIVE DEMO STRIP */}
          <section className="py-24 px-6 border-y border-[var(--border)] bg-[var(--surface)] relative overflow-hidden">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              <div className="text-sm font-bold tracking-widest text-[var(--muted)] mb-8 uppercase">Live Console</div>
              <Card className="w-full bg-black border-[var(--border)] shadow-2xl p-6 md:p-8 font-mono text-sm text-[var(--muted)]">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--border)]">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 opacity-50">wss://api.vaani.com/v1/session</span>
                </div>
                <div className="space-y-3">
                  <p className="text-green-400">► session.start {"{"} locale: "te-IN", voice: "kavitha" {"}"}</p>
                  <p>► agent.state {"{"} state: "LISTENING" {"}"}</p>
                  <p className="opacity-50">Waiting for audio input...</p>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" size="sm" className="bg-[var(--surface)]" onClick={() => setMainView('talk')}>
                    <Play className="w-4 h-4 mr-2" /> Start Demo Session
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          {/* 3. HOW IT WORKS */}
          <section className="py-32 px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-[var(--font-size-h2)] font-serif mb-16">The Pipeline.</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Listen", desc: "Real-time streaming WebM Opus audio converted to 16kHz PCM chunks with sub-100ms VAD.", icon: <Mic className="w-8 h-8 text-[var(--turmeric)]" />, ms: "500ms" },
                  { title: "Understand", desc: "Token-streaming LLM (sarvam-105b) executing strict tool protocols with <tool_call> interception.", icon: <Activity className="w-8 h-8 text-[var(--turmeric)]" />, ms: "300ms" },
                  { title: "Speak", desc: "Base64 sentence-chunked synthesis using bulbul:v3 natively in Telugu.", icon: <Globe className="w-8 h-8 text-[var(--turmeric)]" />, ms: "1100ms" }
                ].map((step, i) => (
                  <Card key={i} gradient className="group cursor-default">
                    <div className="mb-6">{step.icon}</div>
                    <h3 className="text-2xl font-medium mb-3">{step.title}</h3>
                    <p className="text-[var(--muted)] leading-relaxed mb-6">{step.desc}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4">
                      <span className="text-xs uppercase tracking-widest text-[var(--muted)]">p95 Latency</span>
                      <span className="font-mono text-[var(--turmeric)]">{step.ms}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* 5. BENTO FEATURE GRID */}
          <section className="py-32 px-6 bg-[var(--surface)]">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-[var(--font-size-h2)] font-serif mb-16" lang="te">లక్షణాలు. <span className="font-sans text-[var(--muted)] text-3xl md:text-5xl ml-4 tracking-tight">Capabilities</span></h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
                <Card className="md:col-span-2 md:row-span-2 bg-[var(--ink)]">
                  <Layers className="w-8 h-8 mb-6 text-[var(--turmeric)]" />
                  <h3 className="text-3xl font-serif mb-4">Code-Mixing</h3>
                  <p className="text-[var(--muted)] text-lg leading-relaxed">
                    Natively handles "Tanglish" without breaking a sweat. It understands exactly what you mean when you say "రేపు appointment fix చేయండి".
                  </p>
                </Card>
                <Card className="md:col-span-1 md:row-span-1 flex flex-col justify-end">
                  <Activity className="w-6 h-6 mb-4 text-[var(--foreground)]" />
                  <h3 className="text-xl font-medium mb-2">Barge-in</h3>
                  <p className="text-sm text-[var(--muted)]">Interrupt instantly. The agent stops and listens.</p>
                </Card>
                <Card className="md:col-span-1 md:row-span-1 flex flex-col justify-end">
                  <Calendar className="w-6 h-6 mb-4 text-[var(--foreground)]" />
                  <h3 className="text-xl font-medium mb-2">Bookings</h3>
                  <p className="text-sm text-[var(--muted)]">Autonomous DB slot management.</p>
                </Card>
                <Card className="md:col-span-2 md:row-span-1 bg-gradient-to-r from-[var(--surface)] to-[var(--ink)] border-[var(--border)]">
                  <Shield className="w-6 h-6 mb-4 text-[var(--vermilion)]" />
                  <h3 className="text-xl font-medium mb-2">Privacy & Guardrails</h3>
                  <p className="text-sm text-[var(--muted)]">Strict topic avoidance and zero PII logging.</p>
                </Card>
              </div>
            </div>
          </section>

          {/* 8. PROOF & NUMBERS */}
          <section className="py-40 px-6 border-b border-[var(--border)]">
            <div className="max-w-6xl mx-auto text-center">
              <h2 className="text-[var(--font-size-h2)] font-serif mb-20">Built for speed.</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-5xl md:text-7xl font-light font-mono text-[var(--turmeric)] mb-4">1.1<span className="text-2xl">s</span></div>
                  <div className="text-sm text-[var(--muted)] uppercase tracking-widest">E2E Latency (p50)</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl md:text-7xl font-light font-mono text-[var(--foreground)] mb-4">95<span className="text-2xl">%</span></div>
                  <div className="text-sm text-[var(--muted)] uppercase tracking-widest">Eval Pass Rate</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl md:text-7xl font-light font-mono text-[var(--foreground)] mb-4">7</div>
                  <div className="text-sm text-[var(--muted)] uppercase tracking-widest">Native Voices</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-5xl md:text-7xl font-light font-mono text-[var(--foreground)] mb-4">105<span className="text-2xl">B</span></div>
                  <div className="text-sm text-[var(--muted)] uppercase tracking-widest">Model Parameters</div>
                </div>
              </div>
            </div>
          </section>

          {/* 9. CTA & FOOTER */}
          <footer className="relative pt-32 pb-12 overflow-hidden bg-[var(--ink)]">
            <div className="max-w-4xl mx-auto px-6 text-center mb-32 relative z-10">
              <h2 className="text-4xl md:text-6xl font-serif mb-8" lang="te">ప్రారంభిద్దామా?</h2>
              <p className="text-xl text-[var(--muted)] mb-10">Deploy వాణి for your business today.</p>
              <Button size="lg" onClick={() => setMainView('dashboard')}>Open వాణి Studio</Button>
            </div>
            
            <div className="mt-20 border-t border-[var(--border)] pt-12 flex flex-col md:flex-row justify-between items-center px-12 relative z-10">
              <p className="text-[var(--muted)] text-sm mb-4 md:mb-0">© 2026 వాణి AI. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-[var(--muted)]">
                <a href="#" className="hover:text-[var(--foreground)] transition-colors">Twitter</a>
                <a href="#" className="hover:text-[var(--foreground)] transition-colors">GitHub</a>
                <a href="#" className="hover:text-[var(--foreground)] transition-colors">Docs</a>
              </div>
            </div>
            
            {/* Giant Marquee */}
            <div className="absolute bottom-0 left-0 w-full opacity-5 pointer-events-none select-none overflow-hidden translate-y-1/4">
              <Marquee baseVelocity={-2} className="text-[15vw] font-bold font-serif leading-none tracking-tighter">
                వాణి VANI వాణి VANI
              </Marquee>
            </div>
          </footer>
        </main>
      </SmoothScroll>
    </>
  );
}
