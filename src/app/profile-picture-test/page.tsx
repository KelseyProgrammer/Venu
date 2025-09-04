"use client"

import { ProfilePictureDisplay } from "@/components/ui/profile-picture-display"
import { Card } from "@/components/ui/card"

export default function ProfilePictureTestPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Picture Component Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test with different sizes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Different Sizes</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <ProfilePictureDisplay size="xs" />
                <p className="text-sm text-muted-foreground mt-2">XS</p>
              </div>
              <div className="text-center">
                <ProfilePictureDisplay size="sm" />
                <p className="text-sm text-muted-foreground mt-2">SM</p>
              </div>
              <div className="text-center">
                <ProfilePictureDisplay size="md" />
                <p className="text-sm text-muted-foreground mt-2">MD</p>
              </div>
              <div className="text-center">
                <ProfilePictureDisplay size="lg" />
                <p className="text-sm text-muted-foreground mt-2">LG</p>
              </div>
              <div className="text-center">
                <ProfilePictureDisplay size="xl" />
                <p className="text-sm text-muted-foreground mt-2">XL</p>
              </div>
            </div>
          </Card>

          {/* Test with custom styling */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Custom Styling</h2>
            <div className="flex items-center gap-4 mb-4">
              <ProfilePictureDisplay 
                size="lg" 
                className="border-2 border-purple-200 shadow-lg"
              />
              <ProfilePictureDisplay 
                size="lg" 
                className="border-2 border-green-200 shadow-lg"
              />
              <ProfilePictureDisplay 
                size="lg" 
                className="border-2 border-blue-200 shadow-lg"
              />
            </div>
          </Card>

          {/* Test with actual image URLs */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">With Images</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <ProfilePictureDisplay 
                  src="/images/venu-logo.png"
                  alt="Venu Logo"
                  size="lg"
                  className="border-2 border-purple-200"
                />
                <p className="text-sm text-muted-foreground mt-2">Venu Logo</p>
              </div>
              <div className="text-center">
                <ProfilePictureDisplay 
                  src="/images/Alfreds.jpg"
                  alt="Alfreds"
                  size="lg"
                  className="border-2 border-purple-200"
                />
                <p className="text-sm text-muted-foreground mt-2">Alfreds</p>
              </div>
            </div>
          </Card>

          {/* Test with no fallback */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">No Fallback</h2>
            <div className="flex items-center gap-4 mb-4">
              <ProfilePictureDisplay 
                size="lg" 
                showFallback={false}
                className="border-2 border-purple-200"
              />
              <span className="text-sm text-muted-foreground">Empty (no fallback)</span>
            </div>
          </Card>
        </div>

        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Location Dashboard Style</h2>
          <div className="flex items-center gap-4 p-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg">
            <ProfilePictureDisplay 
              src="/images/venu-logo.png"
              alt="Venue"
              size="lg"
              className="border-2 border-purple-200"
            />
            <div>
              <h3 className="font-serif font-bold text-xl">Venue's Dashboard</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>New York, NY</span>
                <span>500 capacity</span>
                <span>4.8 ★</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
