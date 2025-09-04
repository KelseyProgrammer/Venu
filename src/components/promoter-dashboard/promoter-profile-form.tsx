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
  Building,
  Globe,
  Calendar,
  Users,
  TrendingUp
} from "lucide-react"
import { promoterApi } from "@/lib/api"
import { cn } from "@/lib/utils"

// Types for the promoter profile form
interface PromoterProfileFormData {
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
  
  // Business Information
  companyName?: string
  businessDescription?: string
  yearsOfExperience?: number
  specialties: string[]
  
  // Social Media & Website
  website?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  
  // Portfolio
  portfolioImages: string[]
  pastEvents?: string
  testimonials?: string
  
  // Business Details
  businessHours?: string
  serviceAreas?: string[]
  pricingStructure?: string
  bookingPolicies?: string
  
  // References
  references?: string
  certifications?: string[]
}

interface PromoterProfileFormProps {
  initialData?: Partial<PromoterProfileFormData>
  onSave?: (data: PromoterProfileFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  showProgress?: boolean
}

const SPECIALTY_OPTIONS = [
  'Live Music', 'Comedy', 'Theater', 'Dance', 'Corporate Events', 
  'Weddings', 'Private Parties', 'Festivals', 'Conferences', 'Trade Shows',
  'Jazz', 'Rock', 'Electronic', 'Folk', 'Blues', 'Pop', 'Country', 'Hip Hop',
  'Classical', 'Reggae', 'Punk', 'Alternative', 'Indie', 'Metal', 'R&B'
]

const SERVICE_AREA_OPTIONS = [
  'Downtown', 'North Side', 'South Side', 'East Side', 'West Side',
  'Suburbs', 'Rural Areas', 'Multiple Cities', 'Statewide', 'Regional'
]

const CERTIFICATION_OPTIONS = [
  'Event Planning Certification', 'Music Business Degree', 'Marketing Certification',
  'Business License', 'Insurance', 'First Aid/CPR', 'Food Safety', 'Security Training'
]

export function PromoterProfileForm({ 
  initialData, 
  onSave, 
  onCancel, 
  isEditing = false,
  showProgress = true 
}: PromoterProfileFormProps) {
  const [formData, setFormData] = useState<PromoterProfileFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    profileImage: initialData?.profileImage || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    zipCode: initialData?.zipCode || '',
    companyName: initialData?.companyName || '',
    businessDescription: initialData?.businessDescription || '',
    yearsOfExperience: initialData?.yearsOfExperience || 0,
    specialties: initialData?.specialties || [],
    website: initialData?.website || '',
    instagram: initialData?.instagram || '',
    facebook: initialData?.facebook || '',
    linkedin: initialData?.linkedin || '',
    portfolioImages: initialData?.portfolioImages || [],
    pastEvents: initialData?.pastEvents || '',
    testimonials: initialData?.testimonials || '',
    businessHours: initialData?.businessHours || '',
    serviceAreas: initialData?.serviceAreas || [],
    pricingStructure: initialData?.pricingStructure || '',
    bookingPolicies: initialData?.bookingPolicies || '',
    references: initialData?.references || '',
    certifications: initialData?.certifications || []
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

  const handleInputChange = useCallback((field: keyof PromoterProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const handleSpecialtyToggle = useCallback((specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }, [])

  const handleServiceAreaToggle = useCallback((area: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(area)
        ? prev.serviceAreas.filter(a => a !== area)
        : [...prev.serviceAreas, area]
    }))
  }, [])

  const handleCertificationToggle = useCallback((certification: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter(c => c !== certification)
        : [...prev.certifications, certification]
    }))
  }, [])

  const handlePortfolioImageAdd = useCallback((imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      portfolioImages: [...prev.portfolioImages, imageUrl]
    }))
  }, [])

  const handlePortfolioImageRemove = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index)
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
        ? await promoterApi.updatePromoter(formData.id!, formData)
        : await promoterApi.createPromoter(formData)

      if (response.success) {
        setSuccess(true)
        onSave?.(formData)
      } else {
        setError(response.error || 'Failed to save promoter profile')
      }
    } catch (err) {
      setError('An error occurred while saving the profile')
      console.error('Promoter profile save error:', err)
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
          {isEditing ? 'Edit Promoter Profile' : 'Create Promoter Profile'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Update your promoter information' : 'Set up your promoter profile to start booking gigs'}
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
            Promoter profile {isEditing ? 'updated' : 'created'} successfully!
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

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                Company Name
              </Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Enter your company name (optional)"
              />
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <Label htmlFor="businessDescription" className="text-sm font-medium text-foreground">
                Business Description
              </Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe your business and what you do"
                rows={3}
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-foreground">
                Years of Experience
              </Label>
              <Input
                id="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value))}
                placeholder="Enter years of experience"
                min="0"
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
              How people can get in touch with you
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

        {/* Specialties & Service Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Specialties & Service Areas
            </CardTitle>
            <CardDescription>
              What you specialize in and where you work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Specialties */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Event Specialties</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <Button
                    key={specialty}
                    type="button"
                    variant={formData.specialties.includes(specialty) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={cn(
                      formData.specialties.includes(specialty) 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : ""
                    )}
                  >
                    {specialty}
                  </Button>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Service Areas</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SERVICE_AREA_OPTIONS.map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant={formData.serviceAreas.includes(area) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleServiceAreaToggle(area)}
                    className={cn(
                      formData.serviceAreas.includes(area) 
                        ? "bg-purple-600 hover:bg-purple-700 text-white" 
                        : ""
                    )}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
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
                  placeholder="https://yourwebsite.com"
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
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              {/* LinkedIn */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-medium text-foreground">
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Portfolio
            </CardTitle>
            <CardDescription>
              Showcase your work and past events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Portfolio Image */}
            <ImageUpload
              label="Add Portfolio Image"
              value=""
              onChange={handlePortfolioImageAdd}
              placeholder="Upload portfolio image"
            />

            {/* Display Portfolio Images */}
            {formData.portfolioImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.portfolioImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Portfolio image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePortfolioImageRemove(index)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Past Events */}
            <div className="space-y-2">
              <Label htmlFor="pastEvents" className="text-sm font-medium text-foreground">
                Past Events
              </Label>
              <Textarea
                id="pastEvents"
                value={formData.pastEvents}
                onChange={(e) => handleInputChange('pastEvents', e.target.value)}
                placeholder="Describe notable past events you've promoted"
                rows={3}
              />
            </div>

            {/* Testimonials */}
            <div className="space-y-2">
              <Label htmlFor="testimonials" className="text-sm font-medium text-foreground">
                Testimonials
              </Label>
              <Textarea
                id="testimonials"
                value={formData.testimonials}
                onChange={(e) => handleInputChange('testimonials', e.target.value)}
                placeholder="Share testimonials from clients or venues"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Details
            </CardTitle>
            <CardDescription>
              Additional business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Business Hours */}
            <div className="space-y-2">
              <Label htmlFor="businessHours" className="text-sm font-medium text-foreground">
                Business Hours
              </Label>
              <Input
                id="businessHours"
                value={formData.businessHours}
                onChange={(e) => handleInputChange('businessHours', e.target.value)}
                placeholder="e.g., Mon-Fri 9AM-6PM"
              />
            </div>

            {/* Pricing Structure */}
            <div className="space-y-2">
              <Label htmlFor="pricingStructure" className="text-sm font-medium text-foreground">
                Pricing Structure
              </Label>
              <Textarea
                id="pricingStructure"
                value={formData.pricingStructure}
                onChange={(e) => handleInputChange('pricingStructure', e.target.value)}
                placeholder="Describe your pricing structure and fees"
                rows={3}
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

            {/* References */}
            <div className="space-y-2">
              <Label htmlFor="references" className="text-sm font-medium text-foreground">
                References
              </Label>
              <Textarea
                id="references"
                value={formData.references}
                onChange={(e) => handleInputChange('references', e.target.value)}
                placeholder="List professional references"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Certifications & Credentials
            </CardTitle>
            <CardDescription>
              Your professional certifications and credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CERTIFICATION_OPTIONS.map((certification) => (
                <Button
                  key={certification}
                  type="button"
                  variant={formData.certifications.includes(certification) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCertificationToggle(certification)}
                  className={cn(
                    formData.certifications.includes(certification) 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : ""
                  )}
                >
                  {certification}
                </Button>
              ))}
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
