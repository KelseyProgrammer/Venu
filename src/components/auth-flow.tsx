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
import { ChevronLeft, Music, MapPin, Users, Upload, X, Heart } from "lucide-react"
import Image from "next/image"

export function AuthFlow() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"artist" | "venue" | "promoter" | "fan" | null>(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [genres, setGenres] = useState<string[]>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [isCompleting, setIsCompleting] = useState(false)

  const roles = [
    {
      id: "artist" as const,
      icon: Music,
      title: "Artist",
      description: "Discover gigs and build your fanbase",
    },
    {
      id: "venue" as const,
      icon: MapPin,
      title: "Venue",
      description: "Host events and manage bookings",
    },
    {
      id: "promoter" as const,
      icon: Users,
      title: "Promoter",
      description: "Connect artists with venues",
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

  const handleCreateAccount = () => {
    setShowProfileSetup(true)
  }

  const handleCompleteProfile = async () => {
    setIsCompleting(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Navigate to appropriate dashboard based on role
    if (selectedRole === "artist") {
      window.location.href = "/artist"
    } else if (selectedRole === "venue") {
      window.location.href = "/venue"
    } else if (selectedRole === "fan") {
      window.location.href = "/fan"
    } else {
      // For promoter or other roles, go to main page
      window.location.href = "/"
    }

    setIsCompleting(false)
  }

  if (showProfileSetup && selectedRole) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="sm" onClick={() => setShowProfileSetup(false)} className="p-2 mr-4">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Image src="/images/venu-logo.png" alt="Venu" width={32} height={32} className="rounded-lg w-8 h-8" />
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
            {selectedRole === "artist" && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="bio" className="text-foreground">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
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
                    placeholder="@yourusername"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>
              </div>
            )}

            {selectedRole === "venue" && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="capacity" className="text-foreground">
                    Venue Capacity
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
                    Venue Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Music St, City, State"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Venue Photos</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Upload venue photos</p>
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
                    placeholder="Describe some successful events you've promoted..."
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
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground mt-6 disabled:opacity-50"
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
          <Image src="/images/venu-logo.png" alt="Venu" width={32} height={32} className="rounded-lg w-8 h-8" />
          <span className="font-serif font-bold text-xl">venu</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <Tabs value={isSignUp ? "signup" : "login"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger
              value="login"
              onClick={() => setIsSignUp(false)}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              onClick={() => setIsSignUp(true)}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground">Log In</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6">
            {!selectedRole ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="font-serif font-bold text-xl mb-2">Choose Your Role</h2>
                  <p className="text-muted-foreground text-sm">Select how you'll use Venu</p>
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
                <div className="flex items-center gap-2 mb-6">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRole(null)} className="p-1">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {roles.find((r) => r.id === selectedRole)?.title}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Full Name
                    </Label>
                    <Input id="name" placeholder="Your name" className="mt-2 bg-input border-border text-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleCreateAccount}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Create Account
                  </Button>
                </div>
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
            <Button variant="outline" className="h-12 border-border hover:bg-accent/10 bg-transparent">
              Google
            </Button>
            <Button variant="outline" className="h-12 border-border hover:bg-accent/10 bg-transparent">
              Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
