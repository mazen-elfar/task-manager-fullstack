import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MousePointer, Zap } from 'lucide-react';

export interface ParticleConfig {
  baseDensity: number;
  maxSpeed: number;
  radius: [number, number];
  linkDist: number;
  linkAlpha: number;
  mouseInfluence: number;
  repelStrength: number;
  attractStrength: number;
  clickBurst: number;
  colorParticle: string;
  colorLink: string;
}

const DEFAULT_CONFIG: ParticleConfig = {
  baseDensity: 0.12, // particles per 10,000 px^2 (scales with screen size)
  maxSpeed: 0.6, // px / frame
  radius: [1.0, 2.2], // min, max radius
  linkDist: 110, // max distance for lines between particles
  linkAlpha: 0.16, // base line opacity
  mouseInfluence: 115, // mouse influence radius
  repelStrength: 0.35, // repel force strength
  attractStrength: 0.25, // attract force strength
  clickBurst: 130, // impulse upon click
  colorParticle: '#c9e7ff',
  colorLink: '#7dd3fc'
};

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  r: number = 1.5;

  constructor(w: number, h: number, dpr: number, config: ParticleConfig) {
    this.reset(true, w, h, dpr, config);
  }

  reset(randomPos = false, w: number, h: number, dpr: number, config: ParticleConfig) {
    this.x = randomPos ? rand(0, w) : Math.random() < 0.5 ? 0 : w;
    this.y = randomPos ? rand(0, h) : rand(0, h);
    const ang = rand(0, Math.PI * 2);
    const speed = rand(0.05, config.maxSpeed);
    this.vx = Math.cos(ang) * speed;
    this.vy = Math.sin(ang) * speed;
    this.r = rand(config.radius[0], config.radius[1]) * dpr;
  }

  step(
    mx: number | null,
    my: number | null,
    w: number,
    h: number,
    dpr: number,
    config: ParticleConfig,
    isAttract: boolean
  ) {
    // Mouse influence (repel or attract based on mode)
    if (mx !== null && my !== null) {
      const dx = this.x - mx;
      const dy = this.y - my;
      const d2 = dx * dx + dy * dy;
      const r = config.mouseInfluence * dpr;
      if (d2 < r * r) {
        const d = Math.sqrt(d2) || 0.001;
        const ux = dx / d;
        const uy = dy / d;
        const strength = isAttract ? -config.attractStrength : config.repelStrength;
        const factor = (1 - d / r);
        this.vx += ux * strength * factor;
        this.vy += uy * strength * factor;
      }
    }

    // Velocity clamp
    const sp = Math.hypot(this.vx, this.vy);
    const maxSp = config.maxSpeed;
    if (sp > maxSp) {
      this.vx *= maxSp / sp;
      this.vy *= maxSp / sp;
    }

    // Move
    this.x += this.vx * dpr;
    this.y += this.vy * dpr;

    // Wrap around edges with 50px buffer (infinite toroidal space)
    if (this.x < -50) this.x = w + 50;
    if (this.x > w + 50) this.x = -50;
    if (this.y < -50) this.y = h + 50;
    if (this.y > h + 50) this.y = -50;
  }

  draw(ctx: CanvasRenderingContext2D, config: ParticleConfig) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = config.colorParticle;
    ctx.globalAlpha = 0.9;
    ctx.fill();
  }
}

export interface ParticleBackgroundProps {
  showHUD?: boolean;
  className?: string;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  showHUD = true,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const configRef = useRef<ParticleConfig>(DEFAULT_CONFIG);
  const isAttractRef = useRef<boolean>(false);
  const [isAttractMode, setIsAttractMode] = useState<boolean>(false);
  const [particleCount, setParticleCount] = useState<number>(100);
  const [hudDismissed, setHudDismissed] = useState<boolean>(false);

  // Sync state to ref for animation loop
  const toggleAttractMode = useCallback(() => {
    setIsAttractMode((prev) => {
      const next = !prev;
      isAttractRef.current = next;
      return next;
    });
  }, []);

  // Trigger manual burst
  const triggerBurst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const cx = (window.innerWidth / 2) * dpr;
    const cy = (window.innerHeight / 2) * dpr;
    const particles = particlesRef.current;
    const config = configRef.current;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      p.vx += (dx / d) * (config.clickBurst / 75);
      p.vy += (dy / d) * (config.clickBurst / 75);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Guard against environments where getContext is not available (e.g., node / jsdom)
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let W = 0;
    let H = 0;
    let animationFrameId: number;

    const mouse = { x: null as number | null, y: null as number | null, down: false };

    function computeParticlesCount() {
      const area = (W * H) / (DPR * DPR);
      const per10k = configRef.current.baseDensity;
      let targetCount = Math.round(per10k * (area / 10000));
      // Clamp for responsiveness and battery longevity (40 to 220)
      targetCount = clamp(targetCount, 45, 220);
      setParticleCount(targetCount);

      const particles = particlesRef.current;
      if (particles.length < targetCount) {
        const add = targetCount - particles.length;
        for (let i = 0; i < add; i++) {
          particles.push(new Particle(W, H, DPR, configRef.current));
        }
      } else if (particles.length > targetCount) {
        particles.length = targetCount;
      }
    }

    function resize() {
      if (!canvas) return;
      DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      W = canvas.width = Math.floor(window.innerWidth * DPR);
      H = canvas.height = Math.floor(window.innerHeight * DPR);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      computeParticlesCount();
    }

    // Draw lines between proximate neighbors
    function drawLinks() {
      if (!ctx) return;
      const particles = particlesRef.current;
      const config = configRef.current;
      ctx.lineWidth = 1 * DPR;
      ctx.strokeStyle = config.colorLink;
      const maxDist = config.linkDist * DPR;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = config.linkAlpha * (1 - dist / maxDist);
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // Animation Loop
    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      const particles = particlesRef.current;
      const isAttract = isAttractRef.current;
      const config = configRef.current;

      // Step
      for (let i = 0; i < particles.length; i++) {
        particles[i].step(mouse.x, mouse.y, W, H, DPR, config, isAttract);
      }

      // Draw lines
      drawLinks();

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].draw(ctx, config);
      }

      animationFrameId = requestAnimationFrame(loop);
    }

    // Event Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX * DPR;
      mouse.y = e.clientY * DPR;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleMouseDown = () => {
      mouse.down = true;
    };

    const handleMouseUp = () => {
      mouse.down = false;
    };

    const handleClick = (e: MouseEvent) => {
      const mx = e.clientX * DPR;
      const my = e.clientY * DPR;
      const particles = particlesRef.current;
      const config = configRef.current;
      const r = config.mouseInfluence * DPR;
      const burstImpulse = config.clickBurst / 100;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < r * r) {
          const d = Math.sqrt(d2) || 0.001;
          const ux = dx / d;
          const uy = dy / d;
          p.vx += ux * burstImpulse;
          p.vy += uy * burstImpulse;
        }
      }
    };

    // Initialize
    resize();
    // Pre-seed particles
    for (let i = 0; i < 120; i++) {
      particlesRef.current.push(new Particle(W, H, DPR, configRef.current));
    }
    computeParticlesCount();
    loop();

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <>
      {/* Fullscreen Interactive Canvas */}
      <canvas
        id="bg"
        ref={canvasRef}
        aria-hidden="true"
        className={className || 'fixed inset-0 w-screen h-screen pointer-events-none z-0 block'}
      />

      {/* Sleek, professional overlay UI pill inspired by user specification */}
      {showHUD && !hudDismissed && (
        <aside
          role="complementary"
          aria-label="Interactive background particle controls"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-2xl text-xs text-slate-300 select-none transition-all duration-300 hover:border-cyan-500/30 hover:bg-slate-900/80 max-w-[92vw] overflow-x-auto"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="font-semibold text-slate-200">Constellation Field</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          <span className="text-slate-400 hidden md:inline">
            {particleCount} particles • DPR-aware
          </span>

          <span className="text-slate-600 hidden md:inline">•</span>

          {/* Quick Interactive Actions */}
          <button
            type="button"
            onClick={triggerBurst}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-cyan-500/20 text-cyan-300 transition-colors border border-white/5 hover:border-cyan-500/30 font-medium shrink-0"
            title="Burst particles outward"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Burst</span>
          </button>

          <button
            type="button"
            onClick={toggleAttractMode}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors border font-medium shrink-0 ${
              isAttractMode
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
            }`}
            title="Switch cursor physics between Repel and Attract"
          >
            <MousePointer className="w-3 h-3" />
            <span>{isAttractMode ? 'Attract' : 'Repel'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHudDismissed(true)}
            className="text-slate-500 hover:text-slate-300 ml-1 p-0.5 rounded transition-colors text-[11px]"
            title="Minimize HUD"
            aria-label="Dismiss particle HUD"
          >
            ×
          </button>
        </aside>
      )}
    </>
  );
};
