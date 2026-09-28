import type { ComponentType } from 'react';
import {
  SiInstagram, SiFacebook, SiTiktok, SiSnapchat, SiTelegram, SiWhatsapp,
  SiYoutube, SiX, SiThreads, SiGithub,
} from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa6';
import { Globe } from 'lucide-react';

/* Social platforms the admin can attach to the profile. Brand colors are
   used for the icon tint + card glow on hover. */

export type PlatformDef = {
  id: string;
  label: string; // Kurdish label
  icon: ComponentType<{ className?: string }>;
  color: string; // hex used for hover tint
};

export const PLATFORMS: PlatformDef[] = [
  { id: 'instagram', label: 'ئینستاگرام', icon: SiInstagram, color: '#e1306c' },
  { id: 'facebook', label: 'فەیسبووک', icon: SiFacebook, color: '#1877f2' },
  { id: 'tiktok', label: 'تیکتۆک', icon: SiTiktok, color: '#25f4ee' },
  { id: 'snapchat', label: 'سناپچات', icon: SiSnapchat, color: '#f7c800' },
  { id: 'telegram', label: 'تێلێگرام', icon: SiTelegram, color: '#229ed9' },
  { id: 'whatsapp', label: 'واتساپ', icon: SiWhatsapp, color: '#25d366' },
  { id: 'youtube', label: 'یوتیوب', icon: SiYoutube, color: '#ff0000' },
  { id: 'x', label: 'X (تویتەر)', icon: SiX, color: '#a1a1aa' },
  { id: 'linkedin', label: 'لینکدئین', icon: FaLinkedin as ComponentType<{ className?: string }>, color: '#0a66c2' },
  { id: 'threads', label: 'ثرێدز', icon: SiThreads, color: '#c9c9ce' },
  { id: 'github', label: 'گیتهەب', icon: SiGithub, color: '#b7b7bf' },
  { id: 'website', label: 'ماڵپەری تر', icon: Globe as ComponentType<{ className?: string }>, color: '#8b5cf6' },
];

export const PLATFORM_IDS = PLATFORMS.map((p) => p.id);

export function platformDef(id: string): PlatformDef {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[PLATFORMS.length - 1];
}
