'use client';

import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import type { ContentMap, PublicSocial } from '@/lib/content';

/* ═══════════════════════════════════════════════════════════════
   Site-wide client state: content, socials, theme and the admin
   session (token kept in localStorage, validated server-side).
   ═══════════════════════════════════════════════════════════════ */

type ActionResult = { ok: boolean; error?: string };

type SiteContextValue = {
  content: ContentMap;
  socials: PublicSocial[];
  t: (key: string, fallback?: string) => string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isAdmin: boolean;
  adminReady: boolean;
  loginAdmin: (password: string) => Promise<ActionResult>;
  logoutAdmin: () => Promise<void>;
  saveContent: (updates: ContentMap) => Promise<ActionResult>;
  savePhoto: (dataUrl: string) => Promise<ActionResult>;
  addSocial: (s: { platform: string; url: string; label: string; order: number; visible: boolean }) => Promise<ActionResult>;
  updateSocial: (id: string, s: { platform: string; url: string; label: string; order: number; visible: boolean }) => Promise<ActionResult>;
  deleteSocial: (id: string) => Promise<ActionResult>;
  refresh: () => Promise<void>;
};

const TOKEN_KEY = 'omar-admin-token';

const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}

function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  return token ? { 'x-admin-token': token } : {};
}

export function SiteProvider({
  initialContent,
  initialSocials,
  children,
}: {
  initialContent: ContentMap;
  initialSocials: PublicSocial[];
  children: React.ReactNode;
}) {
  const [content, setContent] = useState<ContentMap>(initialContent);
  const [socials, setSocials] = useState<PublicSocial[]>(initialSocials);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReady, setAdminReady] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  /* theme */
  useEffect(() => {
    const stored = localStorage.getItem('omar-theme');
    setTheme(stored === 'light' ? 'light' : 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('omar-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string, fallback = '') => content[key] ?? fallback,
    [content]
  );

  /* restore an existing admin session on load */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setAdminReady(true);
      return;
    }
    fetch('/api/admin/session', { headers: { 'x-admin-token': token }, cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setIsAdmin(!!d?.valid))
      .catch(() => undefined)
      .finally(() => setAdminReady(true));
  }, []);

  const loginAdmin = useCallback(async (password: string): Promise<ActionResult> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) return { ok: false, error: data?.error ?? 'هەڵەیەک ڕوویدا' };
      localStorage.setItem(TOKEN_KEY, data.token);
      setIsAdmin(true);
      return { ok: true };
    } catch {
      return { ok: false, error: 'پەیوەندی بە سێرڤەر نەکرا' };
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: '{}',
      });
    } catch { /* best-effort */ }
    localStorage.removeItem(TOKEN_KEY);
    setIsAdmin(false);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      const d = await res.json();
      if (d?.ok) {
        setContent(d.content);
        setSocials(d.socials);
      }
    } catch { /* keep current */ }
  }, []);

  const saveContent = useCallback(async (updates: ContentMap): Promise<ActionResult> => {
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ updates }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.ok) {
        if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); setIsAdmin(false); }
        return { ok: false, error: d?.error ?? 'پاشەکەوت نەکرا' };
      }
      setContent(d.content);
      setSocials(d.socials);
      return { ok: true };
    } catch {
      return { ok: false, error: 'پەیوەندی بە سێرڤەر نەکرا' };
    }
  }, []);

  const savePhoto = useCallback(async (dataUrl: string): Promise<ActionResult> => {
    return saveContent({ photo_url: dataUrl });
  }, [saveContent]);

  const socialAction = useCallback(async (
    url: string,
    method: 'POST' | 'PUT' | 'DELETE',
    body?: unknown
  ): Promise<ActionResult> => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d?.ok) {
        if (res.status === 401) { localStorage.removeItem(TOKEN_KEY); setIsAdmin(false); }
        return { ok: false, error: d?.error ?? 'کردارەکە سەرکەوتوو نەبوو' };
      }
      await refresh();
      return { ok: true };
    } catch {
      return { ok: false, error: 'پەیوەندی بە سێرڤەر نەکرا' };
    }
  }, [refresh]);

  const addSocial = useCallback((s: { platform: string; url: string; label: string; order: number; visible: boolean }) =>
    socialAction('/api/socials', 'POST', s), [socialAction]);

  const updateSocial = useCallback((id: string, s: { platform: string; url: string; label: string; order: number; visible: boolean }) =>
    socialAction(`/api/socials/${id}`, 'PUT', s), [socialAction]);

  const deleteSocial = useCallback((id: string) =>
    socialAction(`/api/socials/${id}`, 'DELETE'), [socialAction]);

  const value = useMemo<SiteContextValue>(() => ({
    content, socials, t, theme, toggleTheme,
    isAdmin, adminReady, loginAdmin, logoutAdmin,
    saveContent, savePhoto, addSocial, updateSocial, deleteSocial, refresh,
  }), [
    content, socials, t, theme, toggleTheme, isAdmin, adminReady,
    loginAdmin, logoutAdmin, saveContent, savePhoto, addSocial, updateSocial, deleteSocial, refresh,
  ]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
