'use client';

import { useEffect, useRef } from 'react';

/* Fixed page backdrop: three slow-drifting gradient orbs plus a canvas of
   depth-parallax particles (nearer ones drift faster + larger). Purely
   decorative — pointer-events none, and paused for reduced-motion users. */

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    type P = { x: number; y: number; z: number; r: number; vx: number; vy: number; hue: number };
    let pts: P[] = [];

    const seed = () => {
      const count = Math.min(90, Math.round((w * h) / 26000));
      pts = Array.from({ length: count }, () => {
        const z = 0.25 + Math.random() * 0.75; // depth 0.25 (far) → 1 (near)
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: z * 2.1,
          vx: (Math.random() - 0.5) * 0.22 * z,
          vy: (Math.random() - 0.5) * 0.22 * z,
          hue: [245, 262, 293][Math.floor(Math.random() * 3)], // indigo/violet/fuchsia
        };
      });
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    };

    let mx = 0.5;
    let my = 0.5;
    const onMouse = (e: MouseEvent) => {
      mx = e.clientX / w;
      my = e.clientY / h;
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      const dark = document.documentElement.classList.contains('dark');
      const baseAlpha = dark ? 0.5 : 0.35;
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        // subtle parallax against the cursor
        const px = p.x + (mx - 0.5) * 34 * p.z;
        const py = p.y + (my - 0.5) * 34 * p.z;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 84%, ${dark ? 72 : 58}%, ${baseAlpha * p.z})`;
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouse, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden />;
}

export default function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(58% 44% at 82% 8%, var(--page-glow-a), transparent 66%),' +
            'radial-gradient(50% 40% at 12% 30%, var(--page-glow-b), transparent 64%),' +
            'radial-gradient(46% 38% at 68% 88%, var(--page-glow-c), transparent 62%)',
        }}
      />
      <Particles />
    </div>
  );
}
