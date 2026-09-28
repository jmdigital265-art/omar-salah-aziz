'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SiteProvider, useSite } from './site-context';
import LoadingScreen from './loading-screen';
import Backdrop from './backdrop';
import NavBar from './nav-bar';
import Hero from './hero';
import AboutSection from './about-section';
import SocialsSection from './socials-section';
import ContactSection from './contact-section';
import Footer from './footer';
import AdminLogin from './admin/login-modal';
import AdminPanel from './admin/admin-panel';

function Inner() {
  const { t, isAdmin } = useSite();
  const [loginOpen, setLoginOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const secretUnlock = () => {
    if (isAdmin) {
      setPanelOpen(true);
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <>
      <LoadingScreen name={t('brand_name')} />
      <Backdrop />
      <NavBar />

      <main className="relative">
        <Hero />
        <AboutSection />
        <SocialsSection />
        <ContactSection />
        <Footer onSecretUnlock={secretUnlock} />
      </main>

      <AdminLogin
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false);
          setPanelOpen(true);
        }}
      />

      <AnimatePresence>
        {isAdmin && panelOpen && <AdminPanel onClose={() => setPanelOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function SiteShell({
  initialContent,
  initialSocials,
}: {
  initialContent: Record<string, string>;
  initialSocials: { id: string; platform: string; url: string; label: string; order: number; visible: boolean }[];
}) {
  return (
    <SiteProvider initialContent={initialContent} initialSocials={initialSocials}>
      <Inner />
    </SiteProvider>
  );
}
