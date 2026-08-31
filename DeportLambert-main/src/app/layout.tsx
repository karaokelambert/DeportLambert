import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'JL Sports Club 360 – Centro de Gestión Deportiva',
  description: 'JL Sports Club 360 – Centro de Gestión Deportiva Multi-Disciplina',
  manifest: './manifest.json',
  icons: {
    icon: [
      { url: './logo.png', sizes: 'any' },
      { url: './favicon.ico', sizes: 'any' },
      { url: './favicon.svg', type: 'image/svg+xml' },
      { url: './pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: './pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: './apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: './logo.png', sizes: 'any' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <title>JL Sports Club 360</title>
        <link rel="manifest" href="./manifest.json" />
        <link rel="icon" href="./logo.png" sizes="any" />
        <link rel="icon" href="./favicon.ico" sizes="any" />
        <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="./logo.png" />
        <meta name="theme-color" content="#0b0f19" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SportsHub360" />
      </head>
      <body className="antialiased bg-[#70B6E8] text-slate-100 min-h-screen">
        {children}
        {/* Captura inmediata de evento de instalación PWA & Registro de Service Worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
                console.log('[JL360] Evento beforeinstallprompt capturado y disponible.');
              });
              window.addEventListener('appinstalled', function() {
                window.deferredPrompt = null;
                console.log('[JL360] Aplicación instalada exitosamente.');
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('./sw.js').then(function(reg) {
                    console.log('[JL360] Service Worker registrado con scope:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW error:', err);
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

