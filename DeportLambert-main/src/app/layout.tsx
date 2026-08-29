import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#1e40af',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'JL Sports Club 360 – Sistema de Gestión Deportiva',
  description: 'JL Sports Club 360 – Gestión de torneos, equipos y partidos de baloncesto 2026.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>JL Sports Club 360</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JL Sports Club 360" />
      </head>
      <body className="antialiased bg-[#70B6E8] text-slate-100 min-h-screen">
        {children}
        {/* Registro del Service Worker – módulo aditivo de notificaciones */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('[JL360] Service Worker registrado:', reg.scope);
                  }).catch(function(err) {
                    console.warn('[JL360] Service Worker no registrado:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
