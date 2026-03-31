"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, XCircle, Users, LogOut, AlertCircle, Loader2 } from "lucide-react"
import { authUtils } from '@/lib/utils'
import { gigApi } from '@/lib/api'
import jsQR from 'jsqr'

interface ScanResult {
  fanName: string
  quantity: number
  status: 'valid' | 'already_used' | 'wrong_event' | 'error'
  message: string
}

interface DoorScannerProps {
  gigId: string
}

export function DoorScanner({ gigId }: DoorScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanLoopRef = useRef<number | null>(null)
  const lastTokenRef = useRef<string | null>(null) // debounce same QR

  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastScan, setLastScan] = useState<ScanResult | null>(null)
  const [checkedInCount, setCheckedInCount] = useState(0)

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current)
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }, [])

  const processQR = useCallback(async (rawData: string) => {
    // Debounce: ignore if same token within 3s
    if (lastTokenRef.current === rawData) return
    lastTokenRef.current = rawData
    setTimeout(() => { lastTokenRef.current = null }, 3000)

    setIsProcessing(true)
    try {
      const res = await gigApi.scanTicket(gigId, rawData)
      if (res.success && res.data) {
        setCheckedInCount(c => c + res.data!.quantity)
        setLastScan({
          fanName: res.data.fanName,
          quantity: res.data.quantity,
          status: 'valid',
          message: `Entry approved — ${res.data.quantity} ticket${res.data.quantity > 1 ? 's' : ''}`,
        })
      } else {
        const code = (res as { code?: string }).code
        setLastScan({
          fanName: '',
          quantity: 0,
          status: code === 'already_used' ? 'already_used' : 'error',
          message: res.error ?? 'Invalid ticket',
        })
      }
    } catch {
      setLastScan({ fanName: '', quantity: 0, status: 'error', message: 'Network error — try again' })
    } finally {
      setIsProcessing(false)
    }
  }, [gigId])

  const startScanLoop = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && !isProcessing) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code?.data) {
            processQR(code.data)
          }
        }
      }
      scanLoopRef.current = requestAnimationFrame(tick)
    }
    scanLoopRef.current = requestAnimationFrame(tick)
  }, [isProcessing, processQR])

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // rear camera on mobile
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current!.play()
          setCameraActive(true)
          startScanLoop()
        }
      }
    } catch (err: unknown) {
      const e = err as { name?: string }
      setCameraError(e.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access and try again.'
        : 'Could not access camera. Make sure no other app is using it.')
    }
  }, [startScanLoop])

  // Stop camera on unmount
  useEffect(() => () => stopCamera(), [stopCamera])

  const isAuthenticated = authUtils.isAuthenticated()

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 max-w-sm w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="font-serif font-bold text-xl">Sign in required</h2>
          <p className="text-sm text-muted-foreground">You must be signed in as the designated door person to scan tickets.</p>
          <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => window.location.href = '/'}>
            Go to Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif font-bold text-xl text-foreground">Door Check-in</h1>
          <p className="text-xs text-muted-foreground">Gig ID: {gigId}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { stopCamera(); authUtils.logout() }}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Logout
        </Button>
      </div>

      {/* Check-in counter */}
      <Card className="p-4 bg-card border-border mb-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">Checked in this session</span>
          <Badge className="bg-purple-600 text-white">
            <Users className="w-3 h-3 mr-1" />
            {checkedInCount}
          </Badge>
        </div>
      </Card>

      {/* Camera */}
      <Card className="p-4 bg-card border-border mb-4">
        <h3 className="font-semibold text-foreground mb-3 text-center">QR Code Scanner</h3>

        <div className="relative rounded-lg overflow-hidden bg-black aspect-square max-w-xs mx-auto">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          {/* Scan frame overlay */}
          {cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-purple-400 rounded-lg opacity-70" />
            </div>
          )}
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Camera className="w-12 h-12 text-gray-400" />
              <p className="text-sm text-gray-400">Camera off</p>
            </div>
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />

        {cameraError && (
          <p className="text-sm text-red-500 text-center mt-3">{cameraError}</p>
        )}

        <div className="mt-4">
          {cameraActive ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={stopCamera}
            >
              Stop Camera
            </Button>
          ) : (
            <Button
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white"
              onClick={startCamera}
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          )}
        </div>
      </Card>

      {/* Last scan result */}
      {lastScan && (
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            {lastScan.status === 'valid' ? (
              <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {lastScan.fanName && (
                <p className="font-semibold text-foreground truncate">{lastScan.fanName}</p>
              )}
              <p className="text-sm text-muted-foreground">{lastScan.message}</p>
            </div>
            <Badge
              className={
                lastScan.status === 'valid'
                  ? 'bg-green-600 text-white'
                  : lastScan.status === 'already_used'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-red-600 text-white'
              }
            >
              {lastScan.status === 'valid' ? 'Valid' : lastScan.status === 'already_used' ? 'Already Used' : 'Invalid'}
            </Badge>
          </div>
        </Card>
      )}
    </div>
  )
}
