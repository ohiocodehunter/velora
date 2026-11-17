import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ToastContainer from '@/components/ui/ToastContainer';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink antialiased selection:bg-accent selection:text-surface">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default RootLayout;
