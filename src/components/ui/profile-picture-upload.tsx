"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, User, Camera } from "lucide-react"
import Image from "next/image"
import { uploadApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface ProfilePictureUploadProps {
  value?: string
  onChange: (value: string) => void
  label?: string
  size?: "sm" | "md" | "lg"
  className?: string
  required?: boolean
  disabled?: boolean
  showLabel?: boolean
  requireAuth?: boolean
}

export function ProfilePictureUpload({ 
  value, 
  onChange, 
  label = "Profile Picture",
  size = "md",
  className = "",
  required = false,
  disabled = false,
  showLabel = true,
  requireAuth = true
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Size configurations
  const sizeConfig = {
    sm: { container: "w-20 h-20", image: "w-20 h-20", icon: "w-6 h-6" },
    md: { container: "w-32 h-32", image: "w-32 h-32", icon: "w-8 h-8" },
    lg: { container: "w-40 h-40", image: "w-40 h-40", icon: "w-10 h-10" }
  }

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check authentication only if required
    if (requireAuth) {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setError('Please log in to upload images')
        return
      }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // For testing without auth, create a local URL
      if (!requireAuth) {
        const localUrl = URL.createObjectURL(file)
        onChange(localUrl)
        setIsUploading(false)
        return
      }

      const response = await uploadApi.uploadImage(file)
      
      if (response.success && response.data) {
        onChange(response.data.url)
      } else {
        setError(response.error || 'Failed to upload image')
      }
    } catch (err) {
      setError('Failed to upload image')
      console.error('Profile picture upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [onChange, requireAuth])

  const handleRemove = useCallback(() => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setError(null)
  }, [onChange])

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }, [disabled])

  const getImageUrl = useCallback((url: string) => {
    if (url.startsWith('data:')) return url
    if (url.startsWith('blob:')) return url
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`
  }, [])

  return (
    <div className={cn("space-y-3", className)}>
      {showLabel && (
        <Label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="space-y-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {/* Profile picture display/upload area */}
        <div className="flex items-center gap-4">
          {/* Current profile picture or placeholder */}
          <div className="relative">
            <div className={cn(
              "relative rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center",
              sizeConfig[size].container,
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer hover:border-primary/50 transition-colors"
            )}>
              {value ? (
                <Image
                  src={getImageUrl(value)}
                  alt="Profile picture"
                  fill
                  className="object-cover"
                  sizes={size === "sm" ? "80px" : size === "md" ? "128px" : "160px"}
                />
              ) : (
                <User className={cn("text-muted-foreground", sizeConfig[size].icon)} />
              )}
              
              {/* Upload overlay */}
              {!disabled && !value && (
                <div 
                  className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  onClick={handleClick}
                >
                  <Camera className={cn("text-white", sizeConfig[size].icon)} />
                </div>
              )}
            </div>

            {/* Remove button */}
            {value && !disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isUploading}
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {/* Uploading indicator */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Upload button */}
          {!value && !disabled && (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={isUploading}
                className="bg-transparent"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
