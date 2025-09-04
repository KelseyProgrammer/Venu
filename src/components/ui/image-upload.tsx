"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { uploadApi } from "@/lib/api"

interface ImageUploadProps {
  label?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export function ImageUpload({ 
  label = "Upload Image", 
  value, 
  onChange, 
  placeholder = "Click to upload an image",
  className = "",
  required = false 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if user is authenticated before attempting upload
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please log in to upload images');
      return;
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
      // Upload file to server
      const response = await uploadApi.uploadImage(file)
      
      if (response.success && response.data) {
        // Use the server URL for the image
        onChange(response.data.url)
      } else {
        setError(response.error || 'Failed to upload image')
      }
    } catch (err) {
      setError('Failed to upload image')
      console.error('Image upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      
      <div className="space-y-2">
        {/* File Input (hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Area */}
        {!value ? (
          <div
            onClick={handleClick}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/10 transition-colors"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">{placeholder}</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="bg-transparent"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Choose Image"}
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <Image
                src={value.startsWith('data:') ? value : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${value}`}
                alt="Uploaded image"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Help Text */}
        <p className="text-xs text-muted-foreground">
          Supported formats: JPG, PNG, GIF. Max size: 5MB
        </p>
      </div>
    </div>
  )
}
