const CACHE_NAME = 'sajilo-tuition-v3';

// Essential resources to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

// Activate event - clean up ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// URLs that should NEVER be cached
function shouldSkipCache(url) {
  return (
    url.includes('node_modules/.vite') ||
    url.includes('.vite/deps') ||
    url.includes('supabase.co') ||
    url.includes('googleapis.com') ||
    url.includes('?v=')
  );
}

// Fetch event - network-first strategy for HTML, cache-first for safe assets only
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  // Never cache Vite deps, Supabase, or versioned chunks
  if (shouldSkipCache(request.url)) return;

  // Network-first for navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Cache-first for safe static assets only
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      }).catch(() => undefined);
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'You have a new notification from EduWarn Nepal!',
    icon: '/team-members/eduwarn-logo.jpeg',
    badge: '/team-members/eduwarn-logo.jpeg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    tag: 'sajilo-tuition-notification'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'EduWarn Nepal', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});