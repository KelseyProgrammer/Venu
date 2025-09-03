"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, UserPlus } from "lucide-react"
import { LocationProfile } from "@/lib/api"
import { useLocation } from "@/hooks/useLocation"

interface MoreSettingsProps {
  location?: LocationProfile | null;
  authorizedPromoters?: Array<{ id: string; name: string; email: string; firstName?: string; lastName?: string; role?: string; _id?: string }>;
}

export function MoreSettings({ location, authorizedPromoters }: MoreSettingsProps) {
  const [newPromoterEmail, setNewPromoterEmail] = useState("")
  const [isAddingPromoter, setIsAddingPromoter] = useState(false)
  
  // Get the location hook for promoter management
  const { addPromoter, removePromoter } = useLocation(location?._id || "")

  // Promoter management functions
  const handleAddPromoter = useCallback(async () => {
    if (!newPromoterEmail.trim() || !location) return
    
    setIsAddingPromoter(true)
    try {
      // In a real implementation, you would search for the promoter by email first
      // For now, we'll assume the email corresponds to a user ID
      const result = await addPromoter(newPromoterEmail.trim())
      if (result && result.success) {
        setNewPromoterEmail("")
      } else {
        console.error('Failed to add promoter:', result?.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error adding promoter:', error)
    } finally {
      setIsAddingPromoter(false)
    }
  }, [newPromoterEmail, location, addPromoter])

  const handleRemovePromoter = useCallback(async (promoterId: string) => {
    if (!location) return
    
    try {
      const result = await removePromoter(promoterId)
      if (result && !result.success) {
        console.error('Failed to remove promoter:', result.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error removing promoter:', error)
    }
  }, [location, removePromoter])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Location Settings</h3>
      
      <Card className="p-4 bg-card border-border">
        <h4 className="font-semibold text-foreground mb-4">Venue Information</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-foreground">Venue Name</Label>
            <Input 
              value={location?.name || ""} 
              placeholder="The Blue Note" 
              className="mt-1 bg-input border-border text-foreground" 
              disabled
            />
          </div>
          <div>
            <Label className="text-foreground">Address</Label>
            <Input 
              value={location ? `${location.address}, ${location.city}, ${location.state} ${location.zipCode}` : ""} 
              placeholder="123 Music Street, New York, NY" 
              className="mt-1 bg-input border-border text-foreground" 
              disabled
            />
          </div>
          <div>
            <Label className="text-foreground">Capacity</Label>
            <Input 
              value={location?.capacity || ""} 
              placeholder="100" 
              type="number" 
              className="mt-1 bg-input border-border text-foreground" 
              disabled
            />
          </div>
          <div>
            <Label className="text-foreground">Contact Person</Label>
            <Input 
              value={location?.contactPerson || ""} 
              placeholder="Contact Person" 
              className="mt-1 bg-input border-border text-foreground" 
              disabled
            />
          </div>
          <div>
            <Label className="text-foreground">Contact Email</Label>
            <Input 
              value={location?.contactEmail || ""} 
              placeholder="contact@venue.com" 
              type="email"
              className="mt-1 bg-input border-border text-foreground" 
              disabled
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card border-border">
        <h4 className="font-semibold text-foreground mb-4">Preferences</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Email notifications</span>
            <input type="checkbox" className="w-4 h-4 text-primary" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Auto-approve applications</span>
            <input type="checkbox" className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Public profile</span>
            <input type="checkbox" className="w-4 h-4 text-primary" defaultChecked />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-card border-border">
        <h4 className="font-semibold text-foreground mb-4">Manage Authorized Promoters</h4>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-sm text-foreground">Promoter Email</Label>
              <Input 
                placeholder="Enter promoter email address" 
                type="email"
                value={newPromoterEmail}
                onChange={(e) => setNewPromoterEmail(e.target.value)}
                className="mt-1 bg-input border-border text-foreground" 
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAddPromoter}
                disabled={!newPromoterEmail.trim() || isAddingPromoter}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isAddingPromoter ? "Adding..." : "Add Promoter"}
              </Button>
            </div>
          </div>
          
          {authorizedPromoters && authorizedPromoters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Authorized Promoters</Label>
              <div className="space-y-2">
                {authorizedPromoters.map((promoter) => (
                  <div key={promoter._id || promoter.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">
                        {promoter.firstName || promoter.name} {promoter.lastName || ""}
                      </div>
                      <div className="text-sm text-muted-foreground">{promoter.email}</div>
                      <div className="text-sm text-blue-600 font-medium">Role: {promoter.role || "Promoter"}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePromoter(promoter._id || promoter.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(!authorizedPromoters || authorizedPromoters.length === 0) && (
            <div className="text-center py-4 text-muted-foreground">
              No authorized promoters yet. Add promoters to allow them to create gigs at this location.
            </div>
          )}
        </div>
      </Card>


    </div>
  )
}
