"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { ChevronLeft, Music, MapPin, Users, Upload, X, Heart } from "lucide-react"
import Image from "next/image"
import { authApi, artistApi, apiUtils } from "@/lib/api"

export function AuthFlow() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"artist" | "location" | "promoter" | "fan" | null>(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [genres, setGenres] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [isCompleting, setIsCompleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form data state
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({ 
    name: "", 
    email: "", 
    password: "" 
  })
  const [profileData, setProfileData] = useState({
    profileImage: "",
    bio: "",
    spotify: "",
    instagram: "",
    location: "",
    availability: "",
    priceRange: ""
  })

  const roles = [
    {
      id: "artist" as const,
      icon: Music,
      title: "Artist",
      description: "Discover gigs and build your fanbase",
    },
    {
      id: "location" as const,
      icon: MapPin,
      title: "Location",
      description: "Host events and manage bookings",
    },
    {
      id: "promoter" as const,
      icon: Users,
      title: "Promoter",
      description: "Connect artists with locations",
    },
    {
      id: "fan" as const,
      icon: Heart,
      title: "Fan",
      description: "Discover events and buy tickets",
    },
  ]

  const genreOptions = [
    "Rock",
    "Jazz",
    "Electronic",
    "Hip Hop",
    "Folk",
    "Classical",
    "Blues",
    "Country",
    "Reggae",
    "Punk",
  ]
  const equipmentOptions = [
    "PA System",
    "Microphones",
    "Drum Kit",
    "Piano",
    "Guitar Amps",
    "Bass Amps",
    "Lighting",
    "Stage",
  ]
  const regionOptions = ["Downtown", "Midtown", "Uptown", "East Side", "West Side", "Suburbs", "University Area"]

  const addItem = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (item && !list.includes(item)) {
      setList([...list, item])
    }
  }

  const removeItem = (item: string, list: string[], setList: (items: string[]) => void) => {
    setList(list.filter((i) => i !== item))
  }

  const handleCreateAccount = async () => {
    if (!selectedRole) return;
    
    // Client-side validation
    if (!signupData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    const nameParts = signupData.name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length < 2) {
      setError('Please enter your full name (first and last name)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Split name into first and last name
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'User'; // Default to 'User' if no last name
      
      // Register the user
      const response = await authApi.register({
        email: signupData.email,
        password: signupData.password,
        role: selectedRole,
        firstName,
        lastName,
      });
      
      if (response.success && response.data) {
        // Store the auth token
        apiUtils.setAuthToken(response.data.token);
        
        // Store user data in localStorage
        const userData = {
          id: response.data.user._id || response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          role: response.data.user.role,
          profileImage: response.data.user.profileImage
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // If it's an artist, show profile setup
        if (selectedRole === 'artist') {
          setShowProfileSetup(true);
        } else {
          // For other roles, navigate directly to their dashboard
          if (selectedRole === "location") {
            window.location.href = "/location";
          } else if (selectedRole === "fan") {
            window.location.href = "/fan";
          } else if (selectedRole === "promoter") {
            window.location.href = "/promoter";
          } else {
            window.location.href = "/";
          }
        }
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCompleteProfile = async () => {
    if (selectedRole !== 'artist') return;
    
    setIsCompleting(true);
    setError(null);
    
    try {
      // Create artist profile with enhanced data
      const response = await artistApi.createProfile({
        name: signupData.name,
        bio: profileData.bio,
        genre: genres,
        email: signupData.email,
        instagram: profileData.instagram,
        spotify: profileData.spotify,
        location: profileData.location,
        availability: profileData.availability,
        priceRange: profileData.priceRange,
        // Add new fields with default values
        cancellationPolicy: '24 hours notice required',
      });
      
      if (response.success) {
        // Update user data with profile image if available
        const currentUserData = localStorage.getItem('user');
        if (currentUserData) {
          const userData = JSON.parse(currentUserData);
          if (response.data?.profileImage) {
            userData.profileImage = response.data.profileImage;
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
        
        // Navigate to artist dashboard
        window.location.href = "/artist";
      } else {
        setError(response.error || 'Failed to create artist profile');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create artist profile');
    } finally {
      setIsCompleting(false);
    }
  }

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({
        email: loginData.email,
        password: loginData.password,
      });
      
      if (response.success && response.data) {
        // Store the auth token
        apiUtils.setAuthToken(response.data.token);
        
        // Store user data in localStorage
        const userData = {
          id: response.data.user._id || response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          role: response.data.user.role,
          profileImage: response.data.user.profileImage
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate based on user role
        const role = response.data.user.role;
        if (role === "artist") {
          window.location.href = "/artist";
        } else if (role === "location") {
          window.location.href = "/location";
        } else if (role === "fan") {
          window.location.href = "/fan";
        } else if (role === "promoter") {
          window.location.href = "/promoter";
        } else {
          window.location.href = "/";
        }
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showProfileSetup && selectedRole) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" onClick={() => setShowProfileSetup(false)} className="p-2 mr-4">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Image src="/images/venu-logo.png" alt="Venu" width={32} height={32} className="rounded-lg" />
            <span className="font-serif font-bold text-xl">venu</span>
          </div>
        </div>

        <div className="flex-1 max-w-sm mx-auto w-full">
          <div className="text-center mb-6">
            <h2 className="font-serif font-bold text-xl mb-2">Complete Your Profile</h2>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {roles.find((r) => r.id === selectedRole)?.title}
            </Badge>
          </div>

          <Card className="p-6 bg-card border-border">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {selectedRole === "artist" && (
              <div className="space-y-6">
                {/* Profile Picture Upload */}
                <div>
                  <ProfilePictureUpload
                    value={profileData.profileImage || ""}
                    onChange={(value) => setProfileData(prev => ({ ...prev, profileImage: value }))}
                    label="Profile Picture"
                    size="lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-foreground">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about your music and style..."
                    className="mt-2 bg-input border-border text-foreground min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Genres</Label>
                  <Select onValueChange={(value) => addItem(value, genres, setGenres)}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select genres" />
                    </SelectTrigger>
                    <SelectContent>
                      {genreOptions.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-accent text-accent-foreground">
                        {genre}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeItem(genre, genres, setGenres)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="spotify" className="text-foreground">
                    Spotify Link
                  </Label>
                  <Input
                    id="spotify"
                    value={profileData.spotify}
                    onChange={(e) => setProfileData(prev => ({ ...prev, spotify: e.target.value }))}
                    placeholder="https://open.spotify.com/artist/..."
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="instagram" className="text-foreground">
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram"
                    value={profileData.instagram}
                    onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="@yourusername"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-foreground">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Downtown, East Side"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="availability" className="text-foreground">
                    Availability
                  </Label>
                  <Input
                    id="availability"
                    value={profileData.availability}
                    onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                    placeholder="e.g., Available this month"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="priceRange" className="text-foreground">
                    Price Range
                  </Label>
                  <Input
                    id="priceRange"
                    value={profileData.priceRange}
                    onChange={(e) => setProfileData(prev => ({ ...prev, priceRange: e.target.value }))}
                    placeholder="e.g., $200-400"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>
              </div>
            )}

            {selectedRole === "location" && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="capacity" className="text-foreground">
                    Location Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="e.g. 200"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Available Equipment</Label>
                  <Select onValueChange={(value) => addItem(value, equipment, setEquipment)}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {equipment.map((item) => (
                      <Badge key={item} variant="secondary" className="bg-accent text-accent-foreground">
                        {item}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeItem(item, equipment, setEquipment)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-foreground">
                    Location Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Music St, City, State"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Location Photos</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload location photos</p>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "promoter" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-foreground">Active Regions</Label>
                  <Select onValueChange={(value) => addItem(value, regions, setRegions)}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select regions" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionOptions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {regions.map((region) => (
                      <Badge key={region} variant="secondary" className="bg-accent text-accent-foreground">
                        {region}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeItem(region, regions, setRegions)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-foreground">Preferred Genres</Label>
                  <Select onValueChange={(value) => addItem(value, genres, setGenres)}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select genres" />
                    </SelectTrigger>
                    <SelectContent>
                      {genreOptions.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-accent text-accent-foreground">
                        {genre}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeItem(genre, genres, setGenres)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="experience" className="text-foreground">
                    Years of Experience
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="5-10">5-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="past-events" className="text-foreground">
                    Notable Past Events
                  </Label>
                  <Textarea
                    id="past-events"
                                            placeholder="Describe some successful events you&apos;ve promoted..."
                    className="mt-2 bg-input border-border text-foreground min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {selectedRole === "fan" && (
              <div className="space-y-6">
                <div>
                  <Label className="text-foreground">Favorite Genres</Label>
                  <Select onValueChange={(value) => addItem(value, genres, setGenres)}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select your favorite genres" />
                    </SelectTrigger>
                    <SelectContent>
                      {genreOptions.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {genres.map((genre) => (
                      <Badge key={genre} variant="secondary" className="bg-accent text-accent-foreground">
                        {genre}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeItem(genre, genres, setGenres)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-foreground">Preferred Locations</Label>
                  <Select onValueChange={(value) => addItem(value, regions, setRegions)}>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select preferred areas" />
                    </SelectTrigger>
                    <SelectContent>
                      {regionOptions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {regions.map((region) => (
                      <Badge key={region} variant="secondary" className="bg-accent text-accent-foreground">
                        {region}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0"
                          onClick={() => removeItem(region, regions, setRegions)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-foreground">
                    Typical Ticket Budget
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-2 bg-input border-border text-foreground">
                      <SelectValue placeholder="Select your typical budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-25">$0 - $25</SelectItem>
                      <SelectItem value="25-50">$25 - $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100+">$100+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notifications" className="text-foreground">
                    Notification Preferences
                  </Label>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-notifications" className="rounded border-border" />
                      <Label htmlFor="email-notifications" className="text-sm text-foreground">
                        Email notifications for new events
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="push-notifications" className="rounded border-border" />
                      <Label htmlFor="push-notifications" className="text-sm text-foreground">
                        Push notifications for favorite artists
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleCompleteProfile}
              disabled={isCompleting}
              variant="purple"
              className="w-full h-12 mt-6 disabled:opacity-50"
            >
              {isCompleting ? "Completing Profile..." : "Complete Profile"}
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="p-2 mr-4">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Image src="/images/venu-logo.png" alt="Venu" width={32} height={32} className="rounded-lg" />
          <span className="font-serif font-bold text-xl">venu</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <Tabs value={isSignUp ? "signup" : "login"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="login"
              onClick={() => setIsSignUp(false)}
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              onClick={() => setIsSignUp(true)}
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-6">
            <Card className="p-6 bg-card border-border">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="mt-2 bg-input border-border text-foreground"
                    autoComplete="email"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                    className="mt-2 bg-input border-border text-foreground"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  variant="purple" 
                  className="w-full h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging In..." : "Log In"}
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6">
            {!selectedRole ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="font-serif font-bold text-xl mb-2">Choose Your Role</h2>
                  <p className="text-muted-foreground text-sm">Select how you&apos;ll use Venu</p>
                </div>

                {roles.map((role) => {
                  const IconComponent = role.icon
                  return (
                    <Card
                      key={role.id}
                      className="p-4 cursor-pointer hover:bg-accent/10 transition-colors border-border"
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{role.title}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-6 bg-card border-border">
                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-6">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} className="p-1">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {roles.find((r) => r.id === selectedRole)?.title}
                  </Badge>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }} className="space-y-4">
                  <div>
                    <Label htmlFor="signup-name" className="text-foreground">
                      Full Name
                    </Label>
                    <Input 
                      id="signup-name" 
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="First and last name" 
                      className="mt-2 bg-input border-border text-foreground"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="mt-2 bg-input border-border text-foreground"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-foreground">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      className="mt-2 bg-input border-border text-foreground"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="purple"
                    disabled={isLoading}
                    className="w-full h-12"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* OAuth options */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="purple" className="h-12">
              Google
            </Button>
            <Button variant="purple" className="h-12">
              Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
