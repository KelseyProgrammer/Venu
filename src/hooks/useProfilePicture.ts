import { useState, useCallback, useMemo } from 'react'
import { uploadApi, authApi } from '@/lib/api'

interface UseProfilePictureOptions {
  userId?: string
  currentProfileImage?: string
  onUpdate?: (imageUrl: string) => void
}

export function useProfilePicture({ 
  userId, 
  currentProfileImage = "", 
  onUpdate 
}: UseProfilePictureOptions = {}) {
  const [profileImage, setProfileImage] = useState(currentProfileImage)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Memoize the upload function to prevent unnecessary re-renders
  const uploadProfilePicture = useCallback(async (file: File) => {
    // Check authentication
    const token = localStorage.getItem('authToken')
    if (!token) {
      setError('Please log in to upload images')
      return false
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return false
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return false
    }

    setIsUploading(true)
    setError(null)

    try {
      // Upload the image
      const uploadResponse = await uploadApi.uploadImage(file)
      
      if (!uploadResponse.success || !uploadResponse.data) {
        setError(uploadResponse.error || 'Failed to upload image')
        return false
      }

      const imageUrl = uploadResponse.data.url

      // Update the profile image state
      setProfileImage(imageUrl)

      // Update user profile in database if userId is provided
      if (userId) {
        const updateResponse = await authApi.updateProfile({
          profileImage: imageUrl
        })

        if (!updateResponse.success) {
          setError('Failed to update profile')
          return false
        }
      }

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(imageUrl)
      }

      return true
    } catch (err) {
      setError('Failed to upload image')
      console.error('Profile picture upload error:', err)
      return false
    } finally {
      setIsUploading(false)
    }
  }, [userId, onUpdate])

  // Memoize the remove function
  const removeProfilePicture = useCallback(async () => {
    setIsUploading(true)
    setError(null)

    try {
      // Update user profile in database if userId is provided
      if (userId) {
        const updateResponse = await authApi.updateProfile({
          profileImage: ""
        })

        if (!updateResponse.success) {
          setError('Failed to remove profile picture')
          return false
        }
      }

      // Update the profile image state
      setProfileImage("")

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate("")
      }

      return true
    } catch (err) {
      setError('Failed to remove profile picture')
      console.error('Profile picture removal error:', err)
      return false
    } finally {
      setIsUploading(false)
    }
  }, [userId, onUpdate])

  // Memoize the image URL function
  const getImageUrl = useCallback((url: string) => {
    if (!url) return ""
    if (url.startsWith('data:')) return url
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${url}`
  }, [])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    profileImage,
    isUploading,
    error,
    uploadProfilePicture,
    removeProfilePicture,
    getImageUrl,
    setError
  }), [profileImage, isUploading, error, uploadProfilePicture, removeProfilePicture, getImageUrl])
}
