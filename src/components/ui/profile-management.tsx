"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { User, Save, Edit, MapPin, Building2 } from "lucide-react"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  location: string
  profileImage: string
  bio?: string
}

interface ProfileManagementProps {
  initialData?: Partial<ProfileData>
  userType: "artist" | "promoter" | "location" | "fan"
  onSave?: (data: ProfileData) => void
  className?: string
}

export function ProfileManagement({ 
  initialData = {}, 
  userType, 
  onSave,
  className = "" 
}: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    company: initialData.company || "",
    location: initialData.location || "",
    profileImage: initialData.profileImage || "",
    bio: initialData.bio || ""
  })

  const handleInputChange = useCallback((field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      // Validate required fields
      if (!profileData.firstName.trim() || !profileData.lastName.trim() || !profileData.email.trim()) {
        setSaveMessage("Please fill in all required fields")
        return
      }

      // Call the onSave callback if provided
      if (onSave) {
        onSave(profileData)
      }

      // In a real implementation, you would save to the backend here
      // const response = await authApi.updateProfile(profileData)
      
      setSaveMessage("Profile updated successfully!")
      setIsEditing(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage("Failed to update profile. Please try again.")
      console.error('Profile update error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [profileData, onSave])

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
      case "artist": return <User className="w-5 h-5" />
      case "promoter": return <Building2 className="w-5 h-5" />
      case "location": return <MapPin className="w-5 h-5" />
      case "fan": return <User className="w-5 h-5" />
      default: return <User className="w-5 h-5" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl flex items-center gap-2">
          {getIcon()}
          {getTitle()}
        </h2>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 rounded-md text-sm ${
          saveMessage.includes("successfully") 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfilePictureUpload
                value={profileData.profileImage}
                onChange={(value) => handleInputChange('profileImage', value)}
                size="lg"
                showLabel={false}
                disabled={!isEditing}
              />
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    type="email"
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Phone</Label>
                  <Input 
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    type="tel"
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                {userType === "promoter" && (
                  <div>
                    <Label className="text-sm font-medium text-foreground">Company</Label>
                    <Input 
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      placeholder="Enter company name"
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-foreground">Location</Label>
                  <Input 
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <Label className="text-sm font-medium text-foreground">Bio</Label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={`Tell us about yourself${userType === "artist" ? " and your music" : ""}...`}
                  disabled={!isEditing}
                  className="mt-1 w-full p-3 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground resize-none h-24"
                />
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Status:</span>
                <Badge variant="default" className="bg-green-600 text-white">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Stats (for artists) */}
      {userType === "artist" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground">Gigs This Year</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">$3,200</div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">85%</div>
              <div className="text-sm text-muted-foreground">Booking Rate</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
