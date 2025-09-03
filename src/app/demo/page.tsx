'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Users, Music, MapPin, Heart, Calendar } from "lucide-react"

export default function DemoPage() {
  const openProfile = (path: string, profileName: string) => {
    window.open(path, `_${profileName.toLowerCase()}`, 'width=1200,height=800,scrollbars=yes,resizable=yes')
  }

  const openAllProfiles = () => {
    // Open all 4 main profiles in separate windows
    openProfile('/artist', 'artist')
    openProfile('/location', 'location') 
    openProfile('/fan', 'fan')
    openProfile('/promoter', 'promoter')
  }

  const profiles = [
    {
      name: 'Artist Dashboard',
      path: '/artist',
      description: 'Manage gigs, set availability, track earnings',
      icon: Music,
      color: 'bg-purple-500',
      features: ['Gig Management', 'Earnings Tracking', 'Real-time Updates']
    },
    {
      name: 'Location Dashboard', 
      path: '/location',
      description: 'Manage venue, view bookings, handle operations',
      icon: MapPin,
      color: 'bg-blue-500',
      features: ['Venue Management', 'Booking Overview', 'Operations']
    },
    {
      name: 'Fan Dashboard',
      path: '/fan',
      description: 'Discover events, purchase tickets, track favorites',
      icon: Heart,
      color: 'bg-pink-500',
      features: ['Event Discovery', 'Ticket Purchases', 'Favorites']
    },
    {
      name: 'Promoter Dashboard',
      path: '/promoter', 
      description: 'Create events, manage bookings, track performance',
      icon: Calendar,
      color: 'bg-green-500',
      features: ['Event Creation', 'Booking Management', 'Analytics']
    }
  ]

  const additionalPages = [
    {
      name: 'Door Scanner',
      path: '/door',
      description: 'Scan tickets and manage entry',
      icon: ExternalLink
    },
    {
      name: 'Ticket Purchase',
      path: '/ticket/1', 
      description: 'Purchase flow for fans',
      icon: ExternalLink
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">VENU Multi-Profile Demo</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Test all user profiles and their interactions in separate browser windows
          </p>
          
          <div className="flex gap-4 justify-center mb-8">
            <Button 
              onClick={openAllProfiles}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Users className="mr-2 h-5 w-5" />
              Open All 4 Profiles
            </Button>
          </div>
        </div>

        {/* Main Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {profiles.map((profile) => {
            const IconComponent = profile.icon
            return (
              <Card key={profile.path} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${profile.color} text-white`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>{profile.name}</CardTitle>
                      <CardDescription>{profile.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {profile.features.map((feature) => (
                        <Badge key={feature} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={() => openProfile(profile.path, profile.name)}
                      variant="outline"
                      className="w-full"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open {profile.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Pages */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Additional Pages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalPages.map((page) => {
              const IconComponent = page.icon
              return (
                <Card key={page.path} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{page.name}</h3>
                        <p className="text-sm text-muted-foreground">{page.description}</p>
                      </div>
                      <Button 
                        onClick={() => openProfile(page.path, page.name)}
                        variant="ghost"
                        size="sm"
                      >
                        <IconComponent className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>How to Test Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline">1</Badge>
                <p>Click &quot;Open All 4 Profiles&quot; to launch all dashboards in separate windows</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline">2</Badge>
                <p>Arrange windows side-by-side to monitor real-time updates across profiles</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline">3</Badge>
                <p>Test socket connections and real-time features between different user types</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline">4</Badge>
                <p>Use the Door Scanner and Ticket Purchase pages to test complete user flows</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
