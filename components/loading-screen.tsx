'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Splash preloader: a 3D cube folding around the initial + name reveal.
   Shown on first paint for ~1.9s, then scales away. */

function Cube({ logo }: { logo?: string }) {
  const face =
    'absolute inset-0 flex items-center justify-center rounded-xl border border-white/25 bg-gradient-to-br from-indigo-500/25 via-violet-500/20 to-fuchsia-500/25 backdrop-blur-sm';
  const half = 46; // half of the 92px cube
  const faces: { transform: string }[] = [
    { transform: `translateZ(${half}px)` },
    { transform: `rotateY(180deg) translateZ(${half}px)` },
    { transform: `rotateY(90deg) translateZ(${half}px)` },
    { transform: `rotateY(-90deg) translateZ(${half}px)` },
    { transform: `rotateX(90deg) translateZ(${half}px)` },
    { transform: `rotateX(-90deg) translateZ(${half}px)` },
  ];
  return (
    <div className="perspective-800 flex h-[92px] w-[92px] items-center justify-center">
      <motion.div
        className="preserve-3d relative h-[92px] w-[92px]"
        animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'linear' }}
      >
        {faces.map((f, i) => (
          <div key={i} className={face} style={f}>
            {logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logo} alt="" className="h-[72%] w-[72%] rounded-lg object-contain" draggable={false} />
            ) : (
              <span className="font-kufi text-3xl font-extrabold text-white/85">ع</span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function LoadingScreen({ name, logo }: { name: string; logo?: string }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0c12]"
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(6px)' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Cube logo={logo} />
          </motion.div>

          <motion.h1
            className="font-kufi mt-8 text-3xl font-extrabold text-brand-gradient md:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            {name}
          </motion.h1>

          <div className="mt-6 h-[3px] w-44 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-brand-gradient"
              initial={{ x: '-100%' }}
              animate={{ x: '0%' }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
