"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UploadTestPage() {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

  const handleLogin = () => {
    // Use the real JWT token from the test user registration
    const realToken = 'JWT_TOKEN_REMOVED_FOR_SECURITY'
    localStorage.setItem('authToken', realToken)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
  }

  const checkAuthStatus = () => {
    const token = localStorage.getItem('authToken')
    console.log('🔐 Current auth status:', token ? 'Logged in' : 'Not logged in')
    console.log('🔐 Token value:', token)
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Image Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleLogin} variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
              Login (Set Test Token)
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
            <Button onClick={checkAuthStatus} variant="outline">
              Check Auth Status
            </Button>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Auth Status:</strong> {isLoggedIn ? 'Logged In' : 'Not Logged In'}
            </p>
            <p className="text-sm">
              <strong>Token:</strong> {localStorage.getItem('authToken') || 'None'}
            </p>
          </div>

          <ImageUpload
            label="Test Image Upload"
            value={imageUrl}
            onChange={setImageUrl}
            placeholder="Click to upload a test image"
            required
          />

          {imageUrl && (
            <div className="p-4 bg-green-100 rounded">
              <p className="text-sm text-green-800">
                <strong>Uploaded Image URL:</strong> {imageUrl}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
