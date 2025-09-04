"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileManagement } from "@/components/ui/profile-management"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"
import { ProfilePictureDisplay } from "@/components/ui/profile-picture-display"

export default function PictureUploadDemoPage() {
  const [profileImage, setProfileImage] = useState<string>("")

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Picture Upload Feature Demo</h1>
          <p className="text-muted-foreground">Strategic implementation of picture upload on artist and promoter dashboards</p>
        </div>

        {/* Artist Profile Management Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Artist Dashboard - Profile Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileManagement
              userType="artist"
              initialData={{
                firstName: "The Midnight",
                lastName: "Keys",
                email: "keys@example.com",
                phone: "(555) 123-4567",
                location: "St. Augustine, FL",
                profileImage: profileImage,
                bio: "A dynamic rock band known for high-energy performances and original compositions."
              }}
              onSave={(data) => {
                console.log('Artist profile saved:', data)
                setProfileImage(data.profileImage)
              }}
            />
          </CardContent>
        </Card>

        {/* Promoter Profile Management Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Promoter Dashboard - Profile Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileManagement
              userType="promoter"
              initialData={{
                firstName: "John",
                lastName: "Doe",
                email: "promoter@venu.com",
                phone: "+1 (555) 987-6543",
                company: "VENU Promotions",
                location: "St. Augustine, FL",
                profileImage: profileImage,
                bio: "Experienced promoter with a passion for live music and community events."
              }}
              onSave={(data) => {
                console.log('Promoter profile saved:', data)
                setProfileImage(data.profileImage)
              }}
            />
          </CardContent>
        </Card>

        {/* Standalone Profile Picture Upload Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Standalone Profile Picture Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Upload Component</h3>
                <ProfilePictureUpload
                  value={profileImage}
                  onChange={setProfileImage}
                  label="Upload Profile Picture"
                  size="lg"
                />
              </div>
              <div>
                <h3 className="font-semibold mb-4">Display Component</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Small:</span>
                    <ProfilePictureDisplay src={profileImage} size="sm" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Medium:</span>
                    <ProfilePictureDisplay src={profileImage} size="md" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Large:</span>
                    <ProfilePictureDisplay src={profileImage} size="lg" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Implementation Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">✅ What&apos;s Implemented</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• ProfilePictureUpload component with full functionality</li>
                  <li>• ProfileManagement component for comprehensive profile editing</li>
                  <li>• Integration into Artist Dashboard Profile tab</li>
                  <li>• Integration into Promoter Dashboard More tab</li>
                  <li>• Backend upload API with authentication</li>
                  <li>• File validation and error handling</li>
                  <li>• Responsive design and mobile optimization</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🎯 Strategic Benefits</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Consistent user experience across dashboards</li>
                  <li>• Reusable components for maintainability</li>
                  <li>• Proper form validation and error handling</li>
                  <li>• Follows project&apos;s purple theme standards</li>
                  <li>• TypeScript safety and performance optimization</li>
                  <li>• Real-time feedback and save confirmation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
