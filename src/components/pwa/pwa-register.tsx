'use client'

import { useEffect } from 'react'

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('RECALL PWA Service Worker registered:', reg.scope)
        })
        .catch((err) => {
          console.warn('RECALL PWA Service Worker registration failed:', err)
        })
    }
  }, [])

  return null
}
