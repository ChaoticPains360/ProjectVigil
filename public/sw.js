self.addEventListener('push', (event) => {
  let data = { title: 'Vigil', body: '' }
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Vigil', body: event.data ? event.data.text() : '' }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Vigil', {
      body: data.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})
