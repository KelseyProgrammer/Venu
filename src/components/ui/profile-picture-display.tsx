"use client"

import Image from "next/image"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfilePictureDisplayProps {
  src?: string
  alt?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
  fallbackIcon?: React.ReactNode
  showFallback?: boolean
}

export function ProfilePictureDisplay({ 
  src, 
  alt = "Profile picture",
  size = "md",
  className = "",
  fallbackIcon,
  showFallback = true
}: ProfilePictureDisplayProps) {
  // Size configurations
  const sizeConfig = {
    xs: { container: "w-8 h-8", icon: "w-4 h-4" },
    sm: { container: "w-10 h-10", icon: "w-5 h-5" },
    md: { container: "w-12 h-12", icon: "w-6 h-6" },
    lg: { container: "w-16 h-16", icon: "w-8 h-8" },
    xl: { container: "w-20 h-20", icon: "w-10 h-10" }
  }

  const getImageUrl = (url: string) => {
    if (url.startsWith('data:')) return url
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`
  }

  const hasValidImage = src && src.trim() !== ""

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center",
      sizeConfig[size].container,
      className
    )}>
      {hasValidImage ? (
        <Image
          src={getImageUrl(src)}
          alt={alt}
          fill
          className="object-cover"
          sizes={size === "xs" ? "32px" : size === "sm" ? "40px" : size === "md" ? "48px" : size === "lg" ? "64px" : "80px"}
        />
      ) : showFallback ? (
        fallbackIcon || <User className={cn("text-muted-foreground", sizeConfig[size].icon)} />
      ) : null}
    </div>
  )
}
