"use client"

import { useEffect, useState } from 'react'

export function SocketInitializer() {
  const [status, setStatus] = useState('Initializing...')
  
  useEffect(() => {
    console.log('🔌 SocketInitializer: Component mounted and useEffect running')
    setStatus('Loading socket.io-client...')
    
    // Import socket.io-client dynamically
    import('socket.io-client').then(({ io }) => {
      console.log('✅ SocketInitializer: Socket.io-client loaded successfully')
      setStatus('Socket.io loaded, importing socket manager...')
      
      // Expose io to window for debugging
      if (typeof window !== 'undefined') {
        (window as Window & { io?: typeof io }).io = io
        console.log('🔌 SocketInitializer: Socket.io exposed to window')
      }
      
      // Import socket manager after socket.io is loaded
      import('@/lib/socket').then(({ socketManager }) => {
        console.log('✅ SocketInitializer: Socket manager imported')
        console.log('🔌 SocketInitializer: Socket manager exists:', !!socketManager)
        setStatus('Socket manager loaded, connecting...')
        
        // Expose socket manager to window
        if (typeof window !== 'undefined') {
          (window as Window & { socketManager?: typeof socketManager }).socketManager = socketManager
          console.log('🔌 SocketInitializer: Socket manager exposed to window')
        }
        
        // Initialize socket connection
        socketManager.autoConnect().then(() => {
          console.log('✅ SocketInitializer: Socket auto-connect completed')
          console.log('✅ SocketInitializer: Socket connected:', socketManager.connected)
          setStatus(`Connected: ${socketManager.connected ? 'Yes' : 'No'}`)
        }).catch((error) => {
          console.error('❌ SocketInitializer: Socket auto-connect failed:', error)
          setStatus(`Error: ${error.message}`)
        })
        
      }).catch((error) => {
        console.error('❌ SocketInitializer: Failed to import socket manager:', error)
        setStatus(`Error importing socket manager: ${error.message}`)
      })
      
    }).catch((error) => {
      console.error('❌ SocketInitializer: Failed to load socket.io-client:', error)
      setStatus(`Error loading socket.io: ${error.message}`)
    })
  }, [])

  // Show status in console and optionally render something
  console.log('🔌 SocketInitializer status:', status)
  
  return null // This component doesn't render anything
}
