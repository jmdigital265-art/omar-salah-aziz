'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

type Props = {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  lift?: number;
  glare?: boolean;
};

/** 3D tilt-on-hover wrapper with spring physics and an optional moving glare. */
export default function TiltCard({ children, className = '', intensity = 12, lift = 24, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const springConf = { stiffness: 180, damping: 18, mass: 0.6 };
  const rx = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), springConf);
  const ry = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), springConf);
  const z = useSpring(0, springConf);
  const glareX = useTransform(px, [0, 1], ['20%', '80%']);
  const glareY = useTransform(py, [0, 1], ['15%', '85%']);
  const glareOpacity = useSpring(0, springConf);
  const glareBg = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.55), rgba(167,139,250,0.18) 35%, transparent 65%)`
  );

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    px.set(Math.min(1, Math.max(0, x)));
    py.set(Math.min(1, Math.max(0, y)));
  };

  const onEnter = () => {
    z.set(lift);
    if (glare) glareOpacity.set(0.16);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    z.set(0);
    if (glare) glareOpacity.set(0);
  };

  return (
    <div className={`perspective-1200 ${className}`}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, translateZ: z, transformStyle: 'preserve-3d' }}
        className="relative h-full w-full"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ opacity: glareOpacity, background: glareBg, mixBlendMode: 'overlay' }}
          />
        )}
      </motion.div>
    </div>
  );
}
