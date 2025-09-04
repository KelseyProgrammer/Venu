"use client"

import { useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ImageUpload } from "@/components/ui/image-upload"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Plus,
  X,
  Heart,
  Music,
  Calendar,
  Globe
} from "lucide-react"
import { fanApi } from "@/lib/api"
import { cn } from "@/lib/utils"

// Types for the fan profile form
interface FanProfileFormData {
  // Basic Information
  id?: string
  firstName: string
  lastName: string
  profileImage: string
  
  // Contact Information
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  
  // Preferences
  favoriteGenres: string[]
  favoriteArtists: string[]
  favoriteVenues: string[]
  notificationPreferences: string[]
  
  // Social Media & Website
  instagram?: string
  facebook?: string
  twitter?: string
  
  // Additional Information
  bio?: string
  age?: number
  interests?: string[]
  eventHistory?: string
}

interface FanProfileFormProps {
  initialData?: Partial<FanProfileFormData>
  onSave?: (data: FanProfileFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  showProgress?: boolean
}

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Electronic', 'Folk', 'Blues', 'Pop', 'Country', 'Hip Hop',
  'Classical', 'Reggae', 'Punk', 'Alternative', 'Indie', 'Metal', 'R&B', 'Soul',
  'Funk', 'World', 'Experimental', 'Comedy', 'Theater', 'Dance'
]

const NOTIFICATION_OPTIONS = [
  'New Events', 'Price Changes', 'Artist Updates', 'Venue News', 'Special Offers',
  'Local Events', 'Genre-specific Events', 'Favorite Artist Alerts'
]

const INTEREST_OPTIONS = [
  'Live Music', 'Comedy Shows', 'Theater', 'Dance Performances', 'Open Mic Nights',
  'Music Festivals', 'Local Bands', 'International Artists', 'Acoustic Music',
  'Jazz Clubs', 'Rock Venues', 'Electronic Music', 'Classical Concerts'
]

export function FanProfileForm({ 
  initialData, 
  onSave, 
  onCancel, 
  isEditing = false,
  showProgress = true 
}: FanProfileFormProps) {
  const [formData, setFormData] = useState<FanProfileFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    profileImage: initialData?.profileImage || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    favoriteGenres: initialData?.favoriteGenres || [],
    favoriteArtists: initialData?.favoriteArtists || [],
    favoriteVenues: initialData?.favoriteVenues || [],
    notificationPreferences: initialData?.notificationPreferences || [],
    instagram: initialData?.instagram || '',
    facebook: initialData?.facebook || '',
    twitter: initialData?.twitter || '',
    bio: initialData?.bio || '',
    age: initialData?.age || 0,
    interests: initialData?.interests || [],
    eventHistory: initialData?.eventHistory || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Calculate form completion percentage
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      formData.firstName,
      formData.lastName,
      formData.email
    ]
    
    const filledFields = requiredFields.filter(field => 
      field && (typeof field === 'string' ? field.trim() !== '' : field > 0)
    ).length
    
    return Math.round((filledFields / requiredFields.length) * 100)
  }, [formData])

  const handleInputChange = useCallback((field: keyof FanProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleGenreToggle = useCallback((genre: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }))
  }, [])

  const handleNotificationToggle = useCallback((notification: string) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: prev.notificationPreferences.includes(notification)
        ? prev.notificationPreferences.filter(n => n !== notification)
        : [...prev.notificationPreferences, notification]
    }))
  }, [])

  const handleInterestToggle = useCallback((interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }, [])

  const handleFavoriteArtistAdd = useCallback((artist: string) => {
    if (artist.trim() && !formData.favoriteArtists.includes(artist.trim())) {
      setFormData(prev => ({
        ...prev,
        favoriteArtists: [...prev.favoriteArtists, artist.trim()]
      }))
    }
  }, [formData.favoriteArtists])

  const handleFavoriteArtistRemove = useCallback((artist: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteArtists: prev.favoriteArtists.filter(a => a !== artist)
    }))
  }, [])

  const handleFavoriteVenueAdd = useCallback((venue: string) => {
    if (venue.trim() && !formData.favoriteVenues.includes(venue.trim())) {
      setFormData(prev => ({
        ...prev,
        favoriteVenues: [...prev.favoriteVenues, venue.trim()]
      }))
    }
  }, [formData.favoriteVenues])

  const handleFavoriteVenueRemove = useCallback((venue: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteVenues: prev.favoriteVenues.filter(v => v !== venue)
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (completionPercentage < 100) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = isEditing 
        ? await fanApi.updateFan(formData.id!, formData)
        : await fanApi.createFan(formData)

      if (response.success) {
        setSuccess(true)
        onSave?.(formData)
      } else {
        setError(response.error || 'Failed to save fan profile')
      }
    } catch (err) {
      setError('An error occurred while saving the profile')
      console.error('Fan profile save error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, completionPercentage, isEditing, onSave])

  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? 'Edit Fan Profile' : 'Create Fan Profile'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Update your fan information' : 'Set up your fan profile to discover great events'}
        </p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Profile Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </Card>
      )}

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
            Fan profile {isEditing ? 'updated' : 'created'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential information about you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="space-y-2">
              <ImageUpload
                label="Profile Image"
                value={formData.profileImage}
                onChange={(value) => handleInputChange('profileImage', value)}
                placeholder="Upload your profile image"
                required
              />
            </div>

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
                  placeholder="Enter your first name"
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
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium text-foreground">
                Age
              </Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                placeholder="Enter your age"
                min="13"
                max="120"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself and your music interests"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How we can get in touch with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-foreground">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-foreground">
                  City
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-foreground">
                  State
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-medium text-foreground">
                  ZIP Code
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Music Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Music Preferences
            </CardTitle>
            <CardDescription>
              Help us recommend events you'll love
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Favorite Genres */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Favorite Genres</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <Button
                    key={genre}
                    type="button"
                    variant={formData.favoriteGenres.includes(genre) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleGenreToggle(genre)}
                    className={cn(
                      formData.favoriteGenres.includes(genre) 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : ""
                    )}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>

            {/* Favorite Artists */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Favorite Artists</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add favorite artist"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleFavoriteArtistAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    handleFavoriteArtistAdd(input.value)
                    input.value = ''
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.favoriteArtists.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteArtists.map((artist) => (
                    <Badge key={artist} variant="secondary" className="flex items-center gap-1">
                      {artist}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFavoriteArtistRemove(artist)}
                        className="h-auto p-0 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Venues */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Favorite Venues</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add favorite venue"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleFavoriteVenueAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    handleFavoriteVenueAdd(input.value)
                    input.value = ''
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.favoriteVenues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteVenues.map((venue) => (
                    <Badge key={venue} variant="secondary" className="flex items-center gap-1">
                      {venue}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFavoriteVenueRemove(venue)}
                        className="h-auto p-0 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Interests
            </CardTitle>
            <CardDescription>
              What types of events interest you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <Button
                  key={interest}
                  type="button"
                  variant={formData.interests.includes(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleInterestToggle(interest)}
                  className={cn(
                    formData.interests.includes(interest) 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : ""
                  )}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you'd like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {NOTIFICATION_OPTIONS.map((notification) => (
                <Button
                  key={notification}
                  type="button"
                  variant={formData.notificationPreferences.includes(notification) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationToggle(notification)}
                  className={cn(
                    formData.notificationPreferences.includes(notification) 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : ""
                  )}
                >
                  {notification}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Media
            </CardTitle>
            <CardDescription>
              Connect your social media accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm font-medium text-foreground">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@yourusername"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-sm font-medium text-foreground">
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleInputChange('facebook', e.target.value)}
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>

              {/* Twitter */}
              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-sm font-medium text-foreground">
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="@yourusername"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event History
            </CardTitle>
            <CardDescription>
              Tell us about events you've attended
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventHistory" className="text-sm font-medium text-foreground">
                Past Events
              </Label>
              <Textarea
                id="eventHistory"
                value={formData.eventHistory}
                onChange={(e) => handleInputChange('eventHistory', e.target.value)}
                placeholder="Share some memorable events you've attended"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
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
              <>
                {isEditing ? 'Update Profile' : 'Create Profile'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
