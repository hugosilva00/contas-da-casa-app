/**
 * Service worker mínimo da casca: torna a app instalável e abre a casca mesmo sem rede.
 * Rede primeiro (nunca mostra uma casca antiga); a página do Apps Script não passa por aqui.
 */
const CACHE = 'contas-da-casa-casca-v1';
const FICHEIROS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHEIROS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (new URL(e.request.url).origin !== self.location.origin) return;   // Apps Script: direto à rede
  e.respondWith(
    fetch(e.request)
      .then(r => { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); return r; })
      .catch(() => caches.match(e.request))
  );
});
