"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, User, Camera } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface SimpleProfileUploadProps {
  value?: string
  onChange: (value: string) => void
  size?: "sm" | "md" | "lg"
  className?: string
}

export function SimpleProfileUpload({ 
  value, 
  onChange, 
  size = "lg",
  className = ""
}: SimpleProfileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Size configurations
  const sizeConfig = {
    sm: { container: "w-20 h-20", icon: "w-6 h-6" },
    md: { container: "w-32 h-32", icon: "w-8 h-8" },
    lg: { container: "w-40 h-40", icon: "w-10 h-10" }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    setIsUploading(true)

    // Create local URL for immediate preview
    const localUrl = URL.createObjectURL(file)
    onChange(localUrl)
    setIsUploading(false)
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
    <div className={cn("flex-shrink-0", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Profile picture display/upload area */}
      <div className="relative">
        <div 
          className={cn(
            "relative rounded-full overflow-hidden border-2 border-purple-200 bg-muted flex items-center justify-center cursor-pointer hover:border-purple-300 transition-colors",
            sizeConfig[size].container
          )}
          onClick={handleClick}
        >
          {value ? (
            <Image
              src={value}
              alt="Profile picture"
              fill
              className="object-cover"
              sizes={size === "sm" ? "80px" : size === "md" ? "128px" : "160px"}
            />
          ) : (
            <User className={cn("text-muted-foreground", sizeConfig[size].icon)} />
          )}
          
          {/* Upload overlay */}
          {!value && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className={cn("text-white", sizeConfig[size].icon)} />
            </div>
          )}
        </div>

        {/* Remove button */}
        {value && (
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
    </div>
  )
}
