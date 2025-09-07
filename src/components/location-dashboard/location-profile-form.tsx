"use client"

import { useState, useCallback, useMemo } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ImageUpload } from "@/components/ui/image-upload"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  MapPin, 
  Phone, 
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  X,
  Building,
  Globe
} from "lucide-react"
import { locationApi } from "@/lib/api"
import { cn } from "@/lib/utils"

// Types for the location profile form
interface LocationProfileFormData {
  // Basic Information
  id?: string
  name: string
  description?: string
  profileImage: string
  
  // Address Information
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  
  // Contact Information
  contactPerson: string
  contactEmail: string
  contactPhone: string
  
  // Venue Details
  capacity: number
  amenities: string[]
  tags: string[]
  
  // Additional Images
  venueImages: string[]
  
  // Social Media & Website
  website?: string
  instagram?: string
  facebook?: string
  
  // Business Information
  hoursOfOperation?: string
  parkingInfo?: string
  accessibilityInfo?: string
  bookingPolicies?: string
}

interface LocationProfileFormProps {
  initialData?: Partial<LocationProfileFormData>
  onSave?: (data: LocationProfileFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  showProgress?: boolean
}

const AMENITY_OPTIONS = [
  'PA System', 'Lighting', 'Stage', 'Green Room', 'Bar', 'Kitchen', 
  'Parking', 'Wheelchair Accessible', 'Sound Engineer', 'Security',
  'WiFi', 'Air Conditioning', 'Heating', 'Outdoor Space', 'VIP Area'
]

const TAG_OPTIONS = [
  'Live Music', 'Comedy', 'Theater', 'Dance', 'Open Mic', 'Jazz', 
  'Rock', 'Electronic', 'Folk', 'Blues', 'Pop', 'Country', 'Hip Hop',
  'Classical', 'Reggae', 'Punk', 'Alternative', 'Indie', 'Metal', 'R&B'
]

export function LocationProfileForm({ 
  initialData, 
  onSave, 
  onCancel, 
  isEditing = false,
  showProgress = true 
}: LocationProfileFormProps) {
  const [formData, setFormData] = useState<LocationProfileFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    profileImage: initialData?.profileImage || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    country: initialData?.country || 'USA',
    contactPerson: initialData?.contactPerson || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    capacity: initialData?.capacity || 100,
    amenities: initialData?.amenities || [],
    tags: initialData?.tags || [],
    venueImages: initialData?.venueImages || [],
    website: initialData?.website || '',
    instagram: initialData?.instagram || '',
    facebook: initialData?.facebook || '',
    hoursOfOperation: initialData?.hoursOfOperation || '',
    parkingInfo: initialData?.parkingInfo || '',
    accessibilityInfo: initialData?.accessibilityInfo || '',
    bookingPolicies: initialData?.bookingPolicies || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Calculate form completion percentage
  const completionPercentage = useMemo(() => {
    const requiredFields = [
      formData.name,
      formData.address,
      formData.city,
      formData.state,
      formData.zipCode,
      formData.contactPerson,
      formData.contactEmail,
      formData.contactPhone,
      formData.capacity
    ]
    
    const filledFields = requiredFields.filter(field => 
      field && (typeof field === 'string' ? field.trim() !== '' : field > 0)
    ).length
    
    return Math.round((filledFields / requiredFields.length) * 100)
  }, [formData])

  const handleInputChange = useCallback((field: keyof LocationProfileFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleAmenityToggle = useCallback((amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }, [])

  const handleTagToggle = useCallback((tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }, [])

  const handleVenueImageAdd = useCallback((imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      venueImages: [...prev.venueImages, imageUrl]
    }))
  }, [])

  const handleVenueImageRemove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      venueImages: prev.venueImages.filter((_, i) => i !== index)
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
        ? await locationApi.updateLocation(formData.id!, formData)
        : await locationApi.createLocation(formData)

      if (response.success) {
        setSuccess(true)
        onSave?.(formData)
      } else {
        setError(response.error || 'Failed to save location profile')
      }
    } catch (err) {
      setError('An error occurred while saving the profile')
      console.error('Location profile save error:', err)
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
          {isEditing ? 'Edit Location Profile' : 'Create Location Profile'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Update your venue information' : 'Set up your venue profile to start booking gigs'}
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
            Location profile {isEditing ? 'updated' : 'created'} successfully!
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential information about your venue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="space-y-2">
              <ImageUpload
                label="Profile Image"
                value={formData.profileImage}
                onChange={(value) => handleInputChange('profileImage', value)}
                placeholder="Upload venue profile image"
                required
              />
            </div>

            {/* Venue Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Venue Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter venue name"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your venue, atmosphere, and what makes it special"
                rows={3}
              />
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-sm font-medium text-foreground">
                Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                placeholder="Enter venue capacity"
                min="1"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
            <CardDescription>
              Physical location of your venue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium text-foreground">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter street address"
                  required
                />
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium text-foreground">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  required
                />
              </div>

              {/* State */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium text-foreground">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                  required
                />
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-medium text-foreground">
                  ZIP Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="Enter ZIP code"
                  required
                />
              </div>
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
              How people can get in touch with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Person */}
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-sm font-medium text-foreground">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Enter contact person name"
                  required
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground">
                  Contact Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="Enter contact email"
                  required
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">
                  Contact Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="Enter contact phone number"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities & Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Amenities & Tags
            </CardTitle>
            <CardDescription>
              What your venue offers and what types of events you host
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amenities */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map((amenity) => (
                  <Button
                    key={amenity}
                    type="button"
                    variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={cn(
                      formData.amenities.includes(amenity) 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : ""
                    )}
                  >
                    {amenity}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Event Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      formData.tags.includes(tag) 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : ""
                    )}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Venue Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Venue Images
            </CardTitle>
            <CardDescription>
              Add photos of your venue to showcase the space
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Image */}
            <ImageUpload
              label="Add Venue Image"
              value=""
              onChange={handleVenueImageAdd}
              placeholder="Upload additional venue image"
            />

            {/* Display Images */}
            {formData.venueImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.venueImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`Venue image ${index + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleVenueImageRemove(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Media & Website */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Social Media & Website
            </CardTitle>
            <CardDescription>
              Your online presence and social media links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm font-medium text-foreground">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourvenue.com"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-sm font-medium text-foreground">
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@yourvenue"
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
                  placeholder="https://facebook.com/yourvenue"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Additional details about your venue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hours of Operation */}
              <div className="space-y-2">
                <Label htmlFor="hoursOfOperation" className="text-sm font-medium text-foreground">
                  Hours of Operation
                </Label>
                <Input
                  id="hoursOfOperation"
                  value={formData.hoursOfOperation}
                  onChange={(e) => handleInputChange('hoursOfOperation', e.target.value)}
                  placeholder="e.g., Mon-Sat 5PM-2AM"
                />
              </div>

              {/* Parking Info */}
              <div className="space-y-2">
                <Label htmlFor="parkingInfo" className="text-sm font-medium text-foreground">
                  Parking Information
                </Label>
                <Input
                  id="parkingInfo"
                  value={formData.parkingInfo}
                  onChange={(e) => handleInputChange('parkingInfo', e.target.value)}
                  placeholder="e.g., Free parking available"
                />
              </div>
            </div>

            {/* Accessibility Info */}
            <div className="space-y-2">
              <Label htmlFor="accessibilityInfo" className="text-sm font-medium text-foreground">
                Accessibility Information
              </Label>
              <Textarea
                id="accessibilityInfo"
                value={formData.accessibilityInfo}
                onChange={(e) => handleInputChange('accessibilityInfo', e.target.value)}
                placeholder="Describe accessibility features"
                rows={2}
              />
            </div>

            {/* Booking Policies */}
            <div className="space-y-2">
              <Label htmlFor="bookingPolicies" className="text-sm font-medium text-foreground">
                Booking Policies
              </Label>
              <Textarea
                id="bookingPolicies"
                value={formData.bookingPolicies}
                onChange={(e) => handleInputChange('bookingPolicies', e.target.value)}
                placeholder="Describe your booking policies and requirements"
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
