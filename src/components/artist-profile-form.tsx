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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  User, 
  Music, 
  MapPin, 
  Globe, 
  Calendar as CalendarIcon,
  Star,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Video,
  Image as ImageIcon,
  Plus,
  X,
  CalendarDays
} from "lucide-react"
import { artistApi } from "@/lib/api"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// Types for the artist profile form
interface ArtistProfileFormData {
  // Basic Information
  id?: string
  name: string
  bio: string
  genre: string[]
  profileImage: string
  
  // Contact & Social Media
  email: string
  phone?: string
  instagram?: string
  spotify?: string
  appleMusic?: string
  website?: string
  youtube?: string
  tiktok?: string
  followers?: string
  
  // Location & Availability
  location: string
  availability: string
  priceRange: string
  
  // Performance Details
  setLength?: string
  equipmentNeeds?: string
  pricing?: string
  typicalSetlist?: string
  soundRequirements?: string
  
  // Portfolio
  pastPerformances?: string
  reviews?: string
  rating?: number
  portfolioImages?: string[]
  portfolioVideos?: string[]
  
  // Calendar Integration
  unavailableDates?: Date[]
  preferredBookingDays?: string[]
  bookingLeadTime?: string
  cancellationPolicy?: string
}

interface ArtistProfileFormProps {
  initialData?: Partial<ArtistProfileFormData>
  onSave?: (data: ArtistProfileFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  showProgress?: boolean
}

const GENRE_OPTIONS = [
  'Jazz', 'Rock', 'Electronic', 'Folk', 'Blues', 'Pop', 
  'Country', 'Hip Hop', 'Classical', 'Reggae', 'Punk', 'Alternative',
  'Indie', 'Metal', 'R&B', 'Soul', 'Funk', 'World', 'Experimental'
]

const PRICE_RANGE_OPTIONS = [
  '$100-200', '$200-400', '$400-600', '$600-800', '$800-1000', '$1000+'
]

const SET_LENGTH_OPTIONS = [
  '30 minutes', '45 minutes', '1 hour', '1.5 hours', '2 hours', '3+ hours'
]

const BOOKING_LEAD_TIME_OPTIONS = [
  'Same day', '1-3 days', '1 week', '2 weeks', '1 month', '3+ months'
]

const PREFERRED_DAYS_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export function ArtistProfileForm({ 
  initialData = {}, 
  onSave, 
  onCancel, 
  isEditing = false,
  showProgress = true 
}: ArtistProfileFormProps) {
  const [formData, setFormData] = useState<ArtistProfileFormData>({
    name: '',
    bio: '',
    genre: [],
    profileImage: '/images/BandFallBack.PNG',
    email: '',
    phone: '',
    instagram: '',
    spotify: '',
    appleMusic: '',
    website: '',
    youtube: '',
    tiktok: '',
    followers: '',
    location: '',
    availability: '',
    priceRange: '',
    setLength: '',
    equipmentNeeds: '',
    pricing: '',
    typicalSetlist: '',
    soundRequirements: '',
    pastPerformances: '',
    reviews: '',
    rating: 0,
    portfolioImages: [],
    portfolioVideos: [],
    unavailableDates: [],
    preferredBookingDays: [],
    bookingLeadTime: '',
    cancellationPolicy: '',
    ...initialData
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [instagramFollowers, setInstagramFollowers] = useState<string | null>(null)
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Calculate form completion percentage
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      formData.name,
      formData.bio,
      formData.genre.length > 0,
      formData.email,
      formData.location,
      formData.availability,
      formData.priceRange
    ]
    
    const optionalFields = [
      formData.phone,
      formData.instagram,
      formData.spotify,
      formData.appleMusic,
      formData.website,
      formData.youtube,
      formData.tiktok,
      formData.setLength,
      formData.equipmentNeeds,
      formData.pricing,
      formData.typicalSetlist,
      formData.soundRequirements,
      formData.pastPerformances,
      formData.reviews,
      formData.bookingLeadTime,
      formData.cancellationPolicy
    ]
    
    const completedRequired = requiredFields.filter(Boolean).length
    const completedOptional = optionalFields.filter(Boolean).length
    
    const requiredWeight = 0.7 // 70% weight for required fields
    const optionalWeight = 0.3 // 30% weight for optional fields
    
    const requiredScore = (completedRequired / requiredFields.length) * requiredWeight
    const optionalScore = (completedOptional / optionalFields.length) * optionalWeight
    
    return Math.round((requiredScore + optionalScore) * 100)
  }, [formData])

  // Handle form field changes
  const handleInputChange = useCallback((field: keyof ArtistProfileFormData, value: string | string[] | number | Date[] | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }, [])

  // Handle genre selection
  const handleGenreToggle = useCallback((genre: string) => {
    setFormData(prev => ({
      ...prev,
      genre: prev.genre.includes(genre)
        ? prev.genre.filter(g => g !== genre)
        : [...prev.genre, genre]
    }))
  }, [])

  // Handle preferred days selection
  const handlePreferredDayToggle = useCallback((day: string) => {
    setFormData(prev => ({
      ...prev,
      preferredBookingDays: prev.preferredBookingDays?.includes(day)
        ? prev.preferredBookingDays.filter(d => d !== day)
        : [...(prev.preferredBookingDays || []), day]
    }))
  }, [])

  // Handle image upload
  const handleImageUpload = useCallback((imageUrl: string) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }))
  }, [])

  // Handle portfolio image upload
  const handlePortfolioImageUpload = useCallback((imageUrl: string) => {
    setFormData(prev => ({ 
      ...prev, 
      portfolioImages: [...(prev.portfolioImages || []), imageUrl] 
    }))
  }, [])

  // Handle portfolio video upload
  const handlePortfolioVideoUpload = useCallback((videoUrl: string) => {
    setFormData(prev => ({ 
      ...prev, 
      portfolioVideos: [...(prev.portfolioVideos || []), videoUrl] 
    }))
  }, [])

  // Remove portfolio item
  const removePortfolioItem = useCallback((type: 'image' | 'video', index: number) => {
    if (type === 'image') {
      setFormData(prev => ({
        ...prev,
        portfolioImages: prev.portfolioImages?.filter((_, i) => i !== index) || []
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        portfolioVideos: prev.portfolioVideos?.filter((_, i) => i !== index) || []
      }))
    }
  }, [])

  // Fetch Instagram follower count
  const fetchInstagramFollowers = useCallback(async () => {
    if (!formData.instagram) {
      setError('Please enter your Instagram username first')
      return
    }

    setInstagramLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/instagram/followers?username=${formData.instagram}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.followers) {
          setInstagramFollowers(data.followers)
          // Update the form data with the follower count
          setFormData(prev => ({ ...prev, followers: data.followers }))
          setSuccess(`Successfully fetched ${data.followers} followers`)
        } else {
          setError(data.message || 'Unable to fetch Instagram followers. Please enter manually.')
        }
      } else {
        setError('Unable to fetch Instagram followers. Please enter manually.')
      }
    } catch (err) {
      setError('Unable to fetch Instagram followers. Please enter manually.')
    } finally {
      setInstagramLoading(false)
    }
  }, [formData.instagram])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (completionPercentage < 70) {
      setError('Please complete at least 70% of your profile before saving')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (isEditing) {
        // Update existing profile
        const response = await artistApi.updateArtist(initialData.id as string, formData)
        if (response.success) {
          setSuccess('Profile updated successfully!')
          onSave?.(formData)
        } else {
          setError(response.error || 'Failed to update profile')
        }
      } else {
        // Create new profile
        const response = await artistApi.createArtist(formData)
        if (response.success) {
          setSuccess('Profile created successfully!')
          onSave?.(formData)
        } else {
          setError(response.error || 'Failed to create profile')
        }
      }
    } catch (err) {
      console.error('Error saving artist profile:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [formData, completionPercentage, isEditing, initialData.id, onSave])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {isEditing ? 'Edit Artist Profile' : 'Create Artist Profile'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? 'Update your artist profile to keep it current and engaging'
            : 'Tell venues and fans about your music, experience, and what makes you unique'
          }
        </p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Profile Completion</span>
                <span className="text-sm text-muted-foreground">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-3 h-3" />
                <span>{completionPercentage >= 70 ? 'Ready to save' : 'Complete required fields to save'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error/Success Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Tell us about yourself and your music
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Photo</Label>
              <ImageUpload
                value={formData.profileImage}
                onChange={handleImageUpload}
                className="w-32 h-32"
              />
            </div>

            {/* Artist Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Artist/Band Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your artist or band name"
                autoComplete="name"
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about your music, style, and what makes you unique..."
                rows={4}
                maxLength={1000}
                required
              />
              <div className="text-xs text-muted-foreground">
                {formData.bio.length}/1000 characters
              </div>
            </div>

            {/* Genres */}
            <div className="space-y-2">
              <Label>Genres *</Label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map((genre) => (
                  <Badge
                    key={genre}
                    variant={formData.genre.includes(genre) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      formData.genre.includes(genre) 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : "hover:bg-purple-50"
                    }`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
              {formData.genre.length === 0 && (
                <p className="text-xs text-muted-foreground">Select at least one genre</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Social Media */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Contact & Social Media
            </CardTitle>
            <CardDescription>
              Help venues and fans connect with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                autoComplete="tel"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram Username</Label>
              <div className="flex gap-2">
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  onBlur={() => {
                    // Auto-fetch followers when user finishes typing
                    if (formData.instagram && !instagramFollowers && !instagramLoading) {
                      fetchInstagramFollowers()
                    }
                  }}
                  placeholder="@yourusername"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchInstagramFollowers}
                  disabled={instagramLoading || !formData.instagram}
                  className="whitespace-nowrap"
                >
                  {instagramLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  Get Followers
                </Button>
              </div>
              {instagramLoading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Fetching follower count...</span>
                </div>
              )}
              {instagramFollowers && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Users className="w-4 h-4" />
                  <span>{instagramFollowers} followers</span>
                </div>
              )}
              
              {/* Manual Follower Count Input */}
              <div className="space-y-2">
                <Label htmlFor="followers">Follower Count (if auto-fetch doesn't work)</Label>
                <Input
                  id="followers"
                  value={formData.followers || ''}
                  onChange={(e) => handleInputChange('followers', e.target.value)}
                  placeholder="e.g., 1.2K, 5.5M, 1234"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your Instagram follower count manually if the auto-fetch doesn't work
                </p>
              </div>
            </div>

            {/* Spotify */}
            <div className="space-y-2">
              <Label htmlFor="spotify">Spotify Artist Link</Label>
              <Input
                id="spotify"
                value={formData.spotify}
                onChange={(e) => handleInputChange('spotify', e.target.value)}
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>

            {/* Apple Music */}
            <div className="space-y-2">
              <Label htmlFor="appleMusic">Apple Music Artist Link</Label>
              <Input
                id="appleMusic"
                value={formData.appleMusic}
                onChange={(e) => handleInputChange('appleMusic', e.target.value)}
                placeholder="https://music.apple.com/artist/..."
              />
            </div>

            {/* YouTube */}
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube Channel</Label>
              <Input
                id="youtube"
                value={formData.youtube}
                onChange={(e) => handleInputChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            {/* TikTok */}
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok Username</Label>
              <Input
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) => handleInputChange('tiktok', e.target.value)}
                placeholder="@yourusername"
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Availability */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location & Availability
            </CardTitle>
            <CardDescription>
              Where you're based and when you're available
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State or Region"
                autoComplete="address-level2"
                required
              />
            </div>

            {/* Availability */}
            <div className="space-y-2">
              <Label htmlFor="availability">Availability *</Label>
              <Textarea
                id="availability"
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                placeholder="Describe your availability (e.g., 'Available weekends', 'Flexible schedule', 'Weekdays only')"
                rows={3}
                required
              />
            </div>

            {/* Preferred Booking Days */}
            <div className="space-y-2">
              <Label>Preferred Booking Days</Label>
              <div className="flex flex-wrap gap-2">
                {PREFERRED_DAYS_OPTIONS.map((day) => (
                  <Badge
                    key={day}
                    variant={formData.preferredBookingDays?.includes(day) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      formData.preferredBookingDays?.includes(day)
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : "hover:bg-purple-50"
                    }`}
                    onClick={() => handlePreferredDayToggle(day)}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Booking Lead Time */}
            <div className="space-y-2">
              <Label htmlFor="bookingLeadTime">Booking Lead Time</Label>
              <Select value={formData.bookingLeadTime || ''} onValueChange={(value) => handleInputChange('bookingLeadTime', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your typical booking lead time" />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_LEAD_TIME_OPTIONS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label htmlFor="priceRange">Price Range *</Label>
              <Select value={formData.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your typical price range" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_RANGE_OPTIONS.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-2">
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <Textarea
                id="cancellationPolicy"
                value={formData.cancellationPolicy}
                onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                placeholder="Describe your cancellation policy (e.g., '24 hours notice required', '50% deposit non-refundable')"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Performance Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="w-5 h-5" />
              Performance Details
            </CardTitle>
            <CardDescription>
              Technical requirements and performance information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Set Length */}
            <div className="space-y-2">
              <Label htmlFor="setLength">Typical Set Length</Label>
              <Select value={formData.setLength || ''} onValueChange={(value) => handleInputChange('setLength', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your typical set length" />
                </SelectTrigger>
                <SelectContent>
                  {SET_LENGTH_OPTIONS.map((length) => (
                    <SelectItem key={length} value={length}>
                      {length}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment Needs */}
            <div className="space-y-2">
              <Label htmlFor="equipmentNeeds">Equipment Requirements</Label>
              <Textarea
                id="equipmentNeeds"
                value={formData.equipmentNeeds}
                onChange={(e) => handleInputChange('equipmentNeeds', e.target.value)}
                placeholder="Describe any equipment you need (e.g., 'PA system', 'Backline provided', 'Bring own instruments')"
                rows={3}
              />
            </div>

            {/* Sound Requirements */}
            <div className="space-y-2">
              <Label htmlFor="soundRequirements">Sound Requirements</Label>
              <Textarea
                id="soundRequirements"
                value={formData.soundRequirements}
                onChange={(e) => handleInputChange('soundRequirements', e.target.value)}
                placeholder="Describe your sound requirements (e.g., '2 vocal mics', 'DI box for acoustic', 'Monitor mix')"
                rows={3}
              />
            </div>

            {/* Typical Setlist */}
            <div className="space-y-2">
              <Label htmlFor="typicalSetlist">Typical Setlist</Label>
              <Textarea
                id="typicalSetlist"
                value={formData.typicalSetlist}
                onChange={(e) => handleInputChange('typicalSetlist', e.target.value)}
                placeholder="List some of your typical songs or setlist structure"
                rows={4}
              />
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label htmlFor="pricing">Pricing Details</Label>
              <Textarea
                id="pricing"
                value={formData.pricing}
                onChange={(e) => handleInputChange('pricing', e.target.value)}
                placeholder="Additional pricing information (e.g., 'Negotiable for longer sets', 'Discounts for multiple shows')"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Portfolio & Experience
            </CardTitle>
            <CardDescription>
              Showcase your experience and past performances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Past Performances */}
            <div className="space-y-2">
              <Label htmlFor="pastPerformances">Past Performances</Label>
              <Textarea
                id="pastPerformances"
                value={formData.pastPerformances}
                onChange={(e) => handleInputChange('pastPerformances', e.target.value)}
                placeholder="List notable venues, festivals, or performances (e.g., 'Headlined at Blue Note NYC', 'Performed at Coachella 2023')"
                rows={4}
              />
            </div>

            {/* Reviews */}
            <div className="space-y-2">
              <Label htmlFor="reviews">Reviews & Testimonials</Label>
              <Textarea
                id="reviews"
                value={formData.reviews}
                onChange={(e) => handleInputChange('reviews', e.target.value)}
                placeholder="Share positive reviews or testimonials from venues, fans, or industry professionals"
                rows={4}
              />
            </div>

            {/* Portfolio Images */}
            <div className="space-y-2">
              <Label>Portfolio Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.portfolioImages?.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePortfolioItem('image', index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center min-h-[8rem]">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Trigger file upload for portfolio image
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          // Handle file upload - this would typically upload to a server
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            handlePortfolioImageUpload(e.target?.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }
                      input.click()
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Image
                  </Button>
                </div>
              </div>
            </div>

            {/* Portfolio Videos */}
            <div className="space-y-2">
              <Label>Portfolio Videos</Label>
              <div className="space-y-2">
                {formData.portfolioVideos?.map((video, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{video}</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePortfolioItem('video', index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground mb-2" />
                  <Input
                    placeholder="YouTube or Vimeo URL"
                    className="mb-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const url = e.currentTarget.value
                        if (url) {
                          handlePortfolioVideoUpload(url)
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement
                      const url = input.value
                      if (url) {
                        handlePortfolioVideoUpload(url)
                        input.value = ''
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Video
                  </Button>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label htmlFor="rating">Self-Rating (1-5 stars)</Label>
              <Select value={formData.rating?.toString() || ''} onValueChange={(value) => handleInputChange('rating', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Rate your performance level" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Integration */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Calendar Integration
            </CardTitle>
            <CardDescription>
              Manage your availability and unavailable dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unavailable Dates */}
            <div className="space-y-2">
              <Label>Unavailable Dates</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.unavailableDates?.length && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.unavailableDates?.length ? (
                      `${formData.unavailableDates.length} date${formData.unavailableDates.length === 1 ? '' : 's'} selected`
                    ) : (
                      "Select unavailable dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={formData.unavailableDates}
                    onSelect={(dates) => handleInputChange('unavailableDates', dates)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {formData.unavailableDates && formData.unavailableDates.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.unavailableDates?.map((date) => (
                    <Badge key={date.toISOString()} variant="secondary" className="text-xs">
                      {format(date, 'MMM dd, yyyy')}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-3 w-3 p-0"
                        onClick={() => {
                          const newDates = formData.unavailableDates?.filter(d => d.toISOString() !== date.toISOString())
                          handleInputChange('unavailableDates', newDates)
                        }}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={loading || completionPercentage < 70}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
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
