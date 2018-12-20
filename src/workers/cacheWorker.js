const getWindowClients = () =>
  self.clients.claim().then(() => self.clients.matchAll({ type: 'window' }));

self.addEventListener('message', event => {
  console.log('__MESSAGE_:', event.data.type, event);

  event.ports[0].postMessage('ack');
  // }
});

self.addEventListener('install', event =>
  event.waitUntil(() => Promise.resolve(() => self.skipWaiting())),
);

self.addEventListener('activate', event =>
  event.waitUntil(() => Promise.resolve(() => self.clients.claim())),
);
