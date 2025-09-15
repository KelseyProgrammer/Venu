"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, Building2, Music, 
  AlertCircle, CheckCircle, Loader2
} from "lucide-react"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  bio: string
  company?: string // For promoters
  spotify?: string // For artists
  instagram?: string // For artists
}

interface ProfileManagementProps {
  userType: "artist" | "promoter" | "location" | "fan"
  initialData: ProfileData
  onSave: (data: ProfileData) => void
}

export function ProfileManagement({ userType, initialData, onSave }: ProfileManagementProps) {
  const [formData, setFormData] = useState<ProfileData>(initialData)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Calculate form completion percentage
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.phone,
      formData.location,
      formData.bio
    ]
    
    const filledFields = requiredFields.filter(field => 
      field && field.trim() !== ''
    ).length
    
    return Math.round((filledFields / requiredFields.length) * 100)
  }, [formData])

  const handleInputChange = useCallback((field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleSave = useCallback(async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await onSave(formData)
      setSuccess(true)
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('An error occurred while saving the profile')
      console.error('Profile save error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onSave])

  const handleCancel = useCallback(() => {
    setFormData(initialData)
    setIsEditing(false)
    setError(null)
  }, [initialData])

  const getTitle = () => {
    switch (userType) {
      case "artist": return "Artist Profile"
      case "promoter": return "Promoter Profile"
      case "location": return "Venue Profile"
      case "fan": return "Fan Profile"
      default: return "Profile"
    }
  }

  const getIcon = () => {
    switch (userType) {
      case "artist": return Music
      case "promoter": return Building2
      case "location": return Building2
      case "fan": return User
      default: return User
    }
  }

  const IconComponent = getIcon()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? `Edit ${getTitle()}` : getTitle()}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Update your profile information' : 'Manage your profile information'}
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Profile Completion</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Profile updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {getTitle()}
            </CardTitle>
            <CardDescription>
              Essential information about your profile
            </CardDescription>
          </div>
          {!isEditing && (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Edit Profile
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter last name"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-foreground">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your location"
                  required
                />
              </div>

              {/* Company (for promoters) */}
              {userType === "promoter" && (
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-foreground">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company || ""}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter company name"
                  />
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                Bio <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
                required
              />
            </div>
          </div>

          {/* Social Media & Links */}
          {(userType === "artist" || userType === "promoter") && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Spotify (for artists) */}
                {userType === "artist" && (
                  <div className="space-y-2">
                    <Label htmlFor="spotify" className="text-sm font-medium text-foreground">
                      Spotify Profile
                    </Label>
                    <Input
                      id="spotify"
                      type="url"
                      value={formData.spotify || ""}
                      onChange={(e) => handleInputChange('spotify', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://open.spotify.com/artist/..."
                    />
                  </div>
                )}

                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-sm font-medium text-foreground">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={formData.instagram || ""}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    disabled={!isEditing}
                    placeholder="@yourusername"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-4 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
