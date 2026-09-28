'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useSite } from '../site-context';

export default function AdminLogin({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { loginAdmin } = useSite();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(0);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError('');
    const res = await loginAdmin(password);
    setBusy(false);
    if (res.ok) {
      setPassword('');
      onSuccess();
    } else {
      setError(res.error || 'وشەی نهێنی هەڵەیە');
      setShake((s) => s + 1);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* backdrop is deliberately non-dismissing: stray clicks from the
              rapid 5-click unlock must not close the modal */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />

          <motion.div
            className="glass-strong perspective-1200 relative w-full max-w-sm rounded-3xl p-8 shadow-2xl"
            initial={{ opacity: 0, rotateX: -38, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, rotateX: 22, y: 40, scale: 0.94 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onClose}
              className="glass absolute top-4 left-4 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-300 hover:rotate-90 hover:text-foreground"
              aria-label="داخستن"
            >
              <X className="h-4.5 w-4.5" aria-hidden />
            </button>
            <motion.div
              key={shake}
              animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}}
              transition={{ duration: 0.45 }}
              className="flex flex-col items-center gap-5"
            >
              <span className="bg-brand-gradient flex h-16 w-16 items-center justify-center rounded-2xl shadow-xl shadow-violet-500/40">
                <Lock className="h-7 w-7 text-white" aria-hidden />
              </span>
              <div className="text-center">
                <h2 className="text-xl font-extrabold">پانێڵی بەڕێوەبەر</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">تکایە وشەی نهێنی بنووسە بۆ چوونە ژوورەوە</p>
              </div>

              <form onSubmit={submit} className="w-full space-y-3">
                <div className="relative">
                  <Lock className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <input
                    type={show ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="وشەی نهێنی"
                    autoFocus
                    dir="ltr"
                    className="input-theme h-12 text-center text-[15px] tracking-widest pr-10 pl-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={show ? 'شاردنەوە' : 'پیشاندان'}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {error && <p className="text-center text-[13px] font-bold text-rose-500">{error}</p>}

                <button type="submit" disabled={busy || !password} className="btn-primary h-12 w-full text-[15px]">
                  {busy ? <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden /> : 'چوونەژوورەوە'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
