'use client';

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Loader2, Check, Save, ImagePlus, Trash2, Pencil, Plus,
  KeyRound, LogOut, FileText, Share2, Settings2, EyeOff, Eye, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useSite } from '../site-context';
import { PLATFORMS, platformDef } from '../platforms';
import { compressImage, formatBytes } from '@/lib/image-client';
import type { ContentMap } from '@/lib/content';

/* ═══════════════════════════════════════════════════════════════
   Admin panel — full-screen overlay that swings in with a 3D
   transition. Tabs: texts · photo · socials · settings.
   ═══════════════════════════════════════════════════════════════ */

type TabId = 'texts' | 'photo' | 'socials' | 'settings';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'texts', label: 'دەقەکان', icon: <FileText className="h-4 w-4" aria-hidden /> },
  { id: 'photo', label: 'وێنەکان', icon: <ImagePlus className="h-4 w-4" aria-hidden /> },
  { id: 'socials', label: 'سۆشیال', icon: <Share2 className="h-4 w-4" aria-hidden /> },
  { id: 'settings', label: 'ڕێکخستن', icon: <Settings2 className="h-4 w-4" aria-hidden /> },
];

const TEXT_FIELDS: { key: string; label: string; area?: boolean; ltr?: boolean; hint?: string }[] = [
  { key: 'brand_name', label: 'ناوی براند (کوردی)' },
  { key: 'brand_name_en', label: 'ناوی براند (ئینگلیزی)', ltr: true },
  { key: 'hero_greeting', label: 'ڕێکاری سەرەتا (بسڵاو…)' },
  { key: 'hero_name', label: 'ناوی گەورە لە سەرەتادا' },
  { key: 'hero_title', label: 'ناونیشان / پیشە' },
  { key: 'hero_tagline', label: 'دێڕی کورت لە سەرەتادا', area: true },
  { key: 'about_title', label: 'ناونیشانی «دەربارە»' },
  { key: 'about_text', label: 'دەقی «دەربارەی من» (بۆ پەرەگرافی نوێ دوو جار Enter لێبدە)', area: true },
  { key: 'contact_email', label: 'ئیمەیڵ', ltr: true, hint: 'بە بەتاڵی بهێڵەوە ئەگەر ناتەوێت دەربکەوێت' },
  { key: 'contact_phone', label: 'ژمارەی مۆبایل', ltr: true, hint: 'بە بەتاڵی بهێڵەوە ئەگەر ناتەوێت دەربکەوێت' },
  { key: 'contact_location', label: 'ناونیشان / شوێن' },
  { key: 'footer_note', label: 'دەقی پێداوی سەرەوە (فووتەر)' },
  { key: 'footer_qr_hint', label: 'دەقی ژێر کۆدی QR لە فووتەردا' },
  { key: 'footer_rights', label: 'دەقی مافەکان لە فووتەردا', hint: 'دەقەکەی پاش © ساڵ و ناو' },
  { key: 'footer_credit', label: 'دەقی کرێدیت (فووتەر)', ltr: true, hint: 'ئەم دەقە ٥ جار کلیکی بکە دەرگای بەڕێوەبەر دەکاتەوە' },
];

export default function AdminPanel({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>('texts');

  return (
    <motion.div
      className="fixed inset-0 z-[70] overflow-y-auto bg-[hsl(var(--background))]/92 backdrop-blur-xl"
      initial={{ opacity: 0, rotateX: 14, y: 90, transformOrigin: 'top center' }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      exit={{ opacity: 0, rotateX: 10, y: 70, transformOrigin: 'top center' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: '1400px' }}
    >
      <div className="sticky top-0 z-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-extrabold">پانێڵی بەڕێوەبەر</h1>
            <p className="text-[12px] text-muted-foreground">هەموو شتێکی ماڵپەرەکە لێرەوە دەستکاری بکە</p>
          </div>
          <button
            onClick={onClose}
            className="glass flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:rotate-90"
            aria-label="داخستن"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mx-auto flex max-w-3xl gap-1.5 overflow-x-auto px-4 pb-3">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-bold transition-colors ${
                tab === id
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === id && (
                <motion.span
                  layoutId="admin-tab"
                  className="bg-brand-gradient absolute inset-0 rounded-xl shadow-md shadow-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">{icon}{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 pb-28">
        {tab === 'texts' && <TextsTab />}
        {tab === 'photo' && <PhotoTab />}
        {tab === 'socials' && <SocialsTab />}
        {tab === 'settings' && <SettingsTab onClose={onClose} />}
      </div>
    </motion.div>
  );
}

/* ─────────────────── texts tab ─────────────────── */

function Status({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-[13px] font-bold ${ok ? 'text-emerald-500' : 'text-rose-500'}`}
    >
      {ok ? '✅ ' : '⚠️ '}{msg}
    </motion.p>
  );
}

function TextsTab() {
  const { content, saveContent } = useSite();
  const [draft, setDraft] = useState<ContentMap>({ ...content });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const dirty = useMemo(
    () => TEXT_FIELDS.some((f) => (draft[f.key] ?? '') !== (content[f.key] ?? '')),
    [draft, content]
  );

  const save = async () => {
    const updates: ContentMap = {};
    for (const f of TEXT_FIELDS) {
      if ((draft[f.key] ?? '') !== (content[f.key] ?? '')) updates[f.key] = draft[f.key] ?? '';
    }
    if (Object.keys(updates).length === 0) return;
    setBusy(true);
    const res = await saveContent(updates);
    setBusy(false);
    setStatus(res.ok ? { msg: 'پاشەکەوت کرا', ok: true } : { msg: res.error ?? 'هەڵە', ok: false });
    setTimeout(() => setStatus(null), 3500);
  };

  return (
    <div className="space-y-5">
      {TEXT_FIELDS.map((f) => (
        <div key={f.key}>
          <label className="mb-1.5 block text-[13px] font-bold">
            {f.label}
            {f.hint && <span className="mr-2 font-normal text-muted-foreground">— {f.hint}</span>}
          </label>
          {f.area ? (
            <textarea
              value={draft[f.key] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              rows={f.key === 'about_text' ? 7 : 3}
              className="input-theme font-naskh resize-y leading-8"
              dir="auto"
            />
          ) : (
            <input
              value={draft[f.key] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              className="input-theme"
              dir={f.ltr ? 'ltr' : 'rtl'}
            />
          )}
        </div>
      ))}

      <div className="sticky bottom-4 flex items-center gap-4">
        <button onClick={save} disabled={busy || !dirty} className="btn-primary text-[14px]">
          {busy ? <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden /> : <Save className="h-4.5 w-4.5" aria-hidden />}
          پاشەکەوتکردن
        </button>
        {status && <Status msg={status.msg} ok={status.ok} />}
        {!dirty && !status && <span className="text-[12.5px] text-muted-foreground">گۆڕانکاری نییە</span>}
      </div>
    </div>
  );
}

/* ─────────────────── images tab (profile photo + logo) ─────────────────── */

function ImageCard({
  title,
  hint,
  currentUrl,
  fallbackSrc,
  round,
  onPick,
}: {
  title: string;
  hint: string;
  currentUrl: string;
  fallbackSrc: string;
  round?: boolean;
  onPick: (dataUrl: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = preview ?? currentUrl ?? '';

  const pick = async (file?: File | null) => {
    if (!file) return;
    setStatus(null);
    setBusy(true);
    try {
      const { dataUrl, bytes } = await compressImage(file);
      setPreview(dataUrl);
      setInfo(`کۆمپرێسکراو: ${formatBytes(bytes)}`);
    } catch (e) {
      setStatus({ msg: e instanceof Error ? e.message : 'وێنە نەگیرا', ok: false });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!preview) return;
    setBusy(true);
    const res = await onPick(preview);
    setBusy(false);
    setStatus(res.ok ? { msg: 'پاشەکەوت کرا', ok: true } : { msg: res.error ?? 'هەڵە', ok: false });
    if (res.ok) setPreview(null);
    setTimeout(() => setStatus(null), 3500);
  };

  return (
    <div className="glass-strong flex flex-col items-center gap-5 rounded-3xl p-6">
      <div className="text-center">
        <h3 className="text-[15px] font-extrabold">{title}</h3>
        <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
      </div>

      <div className={`relative aspect-square w-40 ${round ? '' : 'portrait-ring rounded-[1.6rem]'}`}>
        <div className={`glass-strong h-full w-full overflow-hidden p-1.5 ${round ? 'rounded-full' : 'rounded-[1.6rem]'}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current || fallbackSrc}
            alt={title}
            className={`h-full w-full object-cover ${round ? 'rounded-full' : 'rounded-[1.3rem]'}`}
          />
        </div>
      </div>
      {info && <p className="text-[12px] text-muted-foreground">{info}</p>}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="btn-ghost text-[13.5px]">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
          هەڵبژاردن
        </button>
        {preview && (
          <button onClick={save} disabled={busy} className="btn-primary text-[13.5px]">
            <Save className="h-4 w-4" aria-hidden />
            پاشەکەوتکردن
          </button>
        )}
      </div>
      {status && <Status msg={status.msg} ok={status.ok} />}
    </div>
  );
}

function PhotoTab() {
  const { content, savePhoto, saveLogo } = useSite();
  return (
    <div className="space-y-6">
      <ImageCard
        title="وێنەی کەسی (پرۆفایل)"
        hint="وێنەی سەرەکی لە پەڕەی سەرەتادا — خۆکارانە کۆمپرێس دەکرێت"
        currentUrl={content.photo_url}
        fallbackSrc="/avatar.svg"
        onPick={savePhoto}
      />
      <ImageCard
        title="لۆگۆی ماڵپەر"
        hint="لە ناڤبار و شاشەی بارکردندا دەردەکەوێت — بەتاڵ بەیت حرفی «ع» دەردەکەوێت"
        currentUrl={content.logo_url}
        fallbackSrc="/avatar.svg"
        round
        onPick={saveLogo}
      />
    </div>
  );
}

/* ─────────────────── socials tab ─────────────────── */

type SocialForm = { platform: string; url: string; label: string; visible: boolean };
const EMPTY_FORM: SocialForm = { platform: 'instagram', url: 'https://', label: '', visible: true };

function SocialsTab() {
  const { socials, addSocial, updateSocial, deleteSocial } = useSite();
  const [form, setForm] = useState<SocialForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const flash = (msg: string, ok: boolean) => {
    setStatus({ msg, ok });
    setTimeout(() => setStatus(null), 3500);
  };

  const submit = async () => {
    if (busy || !/^https?:\/\/\S+\.\S+/i.test(form.url)) {
      flash('بەستەر دروست نییە — بە https:// دەست پێبکە', false);
      return;
    }
    setBusy(true);
    const payload = {
      platform: form.platform,
      url: form.url.trim(),
      label: form.label.trim(),
      order: editingId ? socials.find((s) => s.id === editingId)?.order ?? 0 : socials.length,
      visible: form.visible,
    };
    const res = editingId ? await updateSocial(editingId, payload) : await addSocial(payload);
    setBusy(false);
    if (res.ok) {
      setForm(EMPTY_FORM);
      setEditingId(null);
      flash(editingId ? 'نوێکرایەوە' : 'زیادکرا', true);
    } else {
      flash(res.error ?? 'هەڵە', false);
    }
  };

  const move = async (id: string, dir: -1 | 1) => {
    const idx = socials.findIndex((s) => s.id === id);
    const swapIdx = idx + dir;
    if (idx < 0 || swapIdx < 0 || swapIdx >= socials.length) return;
    const a = socials[idx];
    const b = socials[swapIdx];
    setBusy(true);
    await updateSocial(a.id, { platform: a.platform, url: a.url, label: a.label, order: b.order, visible: true });
    await updateSocial(b.id, { platform: b.platform, url: b.url, label: b.label, order: a.order, visible: true });
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      {/* add / edit form */}
      <div className="glass-strong space-y-4 rounded-3xl p-6">
        <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
          {editingId ? <Pencil className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
          {editingId ? 'دەستکاریکردنی لینک' : 'زیادکردنی لینکی نوێ'}
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold">پلاتفۆرم</label>
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              className="input-theme"
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-bold">ناوی پیشاندان (ئارەزوومەندانە)</label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder={platformDef(form.platform).label}
              className="input-theme"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-bold">بەستەر</label>
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            dir="ltr"
            className="input-theme text-left"
            placeholder="https://instagram.com/username"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px] font-bold">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
            className="h-4.5 w-4.5 accent-violet-500"
          />
          لە ماڵپەردا دەربکەوێت
        </label>

        <div className="flex items-center gap-3">
          <button onClick={submit} disabled={busy} className="btn-primary text-[14px]">
            {busy ? <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden /> : editingId ? <Check className="h-4.5 w-4.5" aria-hidden /> : <Plus className="h-4.5 w-4.5" aria-hidden />}
            {editingId ? 'نوێکردنەوە' : 'زیادکردن'}
          </button>
          {editingId && (
            <button
              onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }}
              className="btn-ghost text-[13px]"
            >
              پاشگەزبوونەوە
            </button>
          )}
          {status && <Status msg={status.msg} ok={status.ok} />}
        </div>
      </div>

      {/* existing links */}
      <div className="space-y-3">
        {socials.length === 0 && (
          <p className="text-center text-[13.5px] text-muted-foreground">هێشتا هیچ لینکێک نییە.</p>
        )}
        {socials.map((s) => {
          const def = platformDef(s.platform);
          const Icon = def.icon;
          return (
            <div
              key={s.id}
              className={`glass flex flex-wrap items-center gap-3 rounded-2xl p-4 ${s.visible ? '' : 'opacity-50'}`}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${def.color}1f`, border: `1px solid ${def.color}45` }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold">{s.label || def.label}</p>
                <p className="truncate text-[12px] text-muted-foreground" dir="ltr">{s.url}</p>
              </div>
              <div className="flex items-center gap-1">
                <IconBtn title="سەرەوە" onClick={() => move(s.id, -1)}><ArrowUp className="h-4 w-4" /></IconBtn>
                <IconBtn title="خوارەوە" onClick={() => move(s.id, 1)}><ArrowDown className="h-4 w-4" /></IconBtn>
                <IconBtn
                  title={s.visible ? 'شاردنەوە' : 'پیشاندان'}
                  onClick={async () => {
                    setBusy(true);
                    await updateSocial(s.id, {
                      platform: s.platform, url: s.url, label: s.label,
                      order: s.order, visible: !s.visible,
                    });
                    setBusy(false);
                  }}
                >
                  {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </IconBtn>
                <IconBtn title="دەستکاری" onClick={() => {
                  setEditingId(s.id);
                  setForm({ platform: s.platform, url: s.url, label: s.label, visible: s.visible });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}>
                  <Pencil className="h-4 w-4" />
                </IconBtn>
                <IconBtn
                  title="سڕینەوە"
                  danger
                  onClick={async () => {
                    if (!window.confirm('دڵنیای لە سڕینەوەی ئەم لینکە؟')) return;
                    setBusy(true);
                    const res = await deleteSocial(s.id);
                    setBusy(false);
                    if (!res.ok) flash(res.error ?? 'هەڵە', false);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IconBtn({
  children, title, onClick, danger,
}: {
  children: React.ReactNode; title: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[hsl(var(--border))] transition-all duration-300 hover:scale-110 ${
        danger ? 'text-rose-500 hover:border-rose-400' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

/* ─────────────────── settings tab ─────────────────── */

function SettingsTab({ onClose }: { onClose: () => void }) {
  const { logoutAdmin } = useSite();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);

  const submit = async () => {
    setStatus(null);
    if (next.length < 10) {
      setStatus({ msg: 'وشەی نهێنی نوێ دەبێت لانیکەم ١٠ پیت بێت', ok: false });
      return;
    }
    if (next !== confirm) {
      setStatus({ msg: 'وشەی نهێنی نوێ و دووبارەکەی وەک یەک نین', ok: false });
      return;
    }
    setBusy(true);
    try {
      const token = localStorage.getItem('omar-admin-token') ?? '';
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ current, next }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d?.ok) {
        setStatus({ msg: 'وشەی نهێنی گۆڕدرا — لە هەموو ئامێرەکانی تر دەرکراویت', ok: true });
        setCurrent(''); setNext(''); setConfirm('');
      } else {
        setStatus({ msg: d?.error ?? 'هەڵە', ok: false });
      }
    } catch {
      setStatus({ msg: 'پەیوەندی بە سێرڤەر نەکرا', ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-strong space-y-4 rounded-3xl p-6">
        <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
          <KeyRound className="h-4 w-4" aria-hidden />
          گۆڕینی وشەی نهێنی
        </h3>
        <PasswordInput label="وشەی نهێنی ئێستا" value={current} onChange={setCurrent} />
        <PasswordInput label="وشەی نهێنی نوێ (لانیکەم ١٠ پیت)" value={next} onChange={setNext} />
        <PasswordInput label="دووبارەکردنەوەی وشەی نهێنی نوێ" value={confirm} onChange={setConfirm} />
        <div className="flex items-center gap-4">
          <button onClick={submit} disabled={busy || !current || !next} className="btn-primary text-[14px]">
            {busy ? <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden /> : <KeyRound className="h-4.5 w-4.5" aria-hidden />}
            گۆڕین
          </button>
          {status && <Status msg={status.msg} ok={status.ok} />}
        </div>
      </div>

      <div className="glass-strong flex flex-col items-center gap-4 rounded-3xl p-6 sm:flex-row sm:justify-between">
        <p className="text-[13.5px] text-muted-foreground">
          بەتاڵکردنی دانیشتن لەم ئامێرە — دووبارە بۆ چوونەژوورەوە وشەی نهێنیت دەوێت.
        </p>
        <button
          onClick={async () => { await logoutAdmin(); onClose(); }}
          className="btn-ghost shrink-0 text-[13.5px] !text-rose-500"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          دەرچوون
        </button>
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-bold">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
        className="input-theme"
      />
    </div>
  );
}
