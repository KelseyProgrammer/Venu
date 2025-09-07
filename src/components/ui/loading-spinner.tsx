import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function LoadingSpinner({ size = "lg", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16", 
    lg: "h-32 w-32",
    xl: "h-48 w-48"
  }

  return (
    <div className={cn("min-h-screen bg-background flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin rounded-full border-b-2 border-purple-600",
        sizeClasses[size]
      )}></div>
    </div>
  )
}
