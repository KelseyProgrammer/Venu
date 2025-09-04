"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { ProfilePictureDisplay } from "@/components/ui/profile-picture-display"
import { useProfilePicture } from "@/hooks/useProfilePicture"
import { Badge } from "@/components/ui/badge"
import { User, Camera, Settings } from "lucide-react"

export function ProfilePictureExample() {
  const [currentUserId, setCurrentUserId] = useState<string>("user-123")
  const [currentProfileImage, setCurrentProfileImage] = useState<string>("")
  
  // Using the profile picture hook
  const {
    profileImage,
    isUploading,
    error,
    uploadProfilePicture,
    removeProfilePicture,
    getImageUrl,
    setError
  } = useProfilePicture({
    userId: currentUserId,
    currentProfileImage,
    onUpdate: (imageUrl) => {
      console.log('Profile picture updated:', imageUrl)
      setCurrentProfileImage(imageUrl)
    }
  })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const success = await uploadProfilePicture(file)
      if (success) {
        console.log('Profile picture uploaded successfully!')
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Profile Picture System</h1>
        <p className="text-muted-foreground">Complete profile picture upload and display system</p>
      </div>

      {/* Profile Picture Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Picture Upload
          </CardTitle>
          <CardDescription>
            Upload and manage your profile picture with validation and error handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProfilePictureUpload
            value={profileImage}
            onChange={(value) => {
              console.log('Profile picture changed:', value)
              setCurrentProfileImage(value)
            }}
            label="Your Profile Picture"
            size="lg"
            required
          />
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Picture Display Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Picture Display Examples
          </CardTitle>
          <CardDescription>
            Different sizes and configurations for displaying profile pictures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            <div className="text-center space-y-2">
              <ProfilePictureDisplay src={profileImage} size="xs" />
              <p className="text-xs text-muted-foreground">Extra Small</p>
            </div>
            <div className="text-center space-y-2">
              <ProfilePictureDisplay src={profileImage} size="sm" />
              <p className="text-xs text-muted-foreground">Small</p>
            </div>
            <div className="text-center space-y-2">
              <ProfilePictureDisplay src={profileImage} size="md" />
              <p className="text-xs text-muted-foreground">Medium</p>
            </div>
            <div className="text-center space-y-2">
              <ProfilePictureDisplay src={profileImage} size="lg" />
              <p className="text-xs text-muted-foreground">Large</p>
            </div>
            <div className="text-center space-y-2">
              <ProfilePictureDisplay src={profileImage} size="xl" />
              <p className="text-xs text-muted-foreground">Extra Large</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual File Upload Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Manual File Upload
          </CardTitle>
          <CardDescription>
            Using the hook directly for custom upload handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-600 file:text-white
                hover:file:bg-purple-700"
            />
            <Button
              onClick={removeProfilePicture}
              variant="outline"
              disabled={!profileImage || isUploading}
            >
              Remove Picture
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Status: {isUploading ? "Uploading..." : "Ready"}
            </Badge>
            {profileImage && (
              <Badge variant="default" className="bg-green-600">
                Picture Set
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current State Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current State</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>User ID:</strong> {currentUserId}</p>
            <p><strong>Profile Image URL:</strong> {profileImage || "None"}</p>
            <p><strong>Is Uploading:</strong> {isUploading ? "Yes" : "No"}</p>
            <p><strong>Error:</strong> {error || "None"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
