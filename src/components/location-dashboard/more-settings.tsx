"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { Promoter, DoorPerson } from "./types"

export function MoreSettings() {
  // Saved promoters state
  const [savedPromoters, setSavedPromoters] = useState<Promoter[]>([])
  const [newPromoterName, setNewPromoterName] = useState("")
  const [newPromoterEmail, setNewPromoterEmail] = useState("")
  const [newPromoterPayout, setNewPromoterPayout] = useState("")
  
  // Saved door persons state
  const [savedDoorPersons, setSavedDoorPersons] = useState<DoorPerson[]>([])
  const [newDoorPersonName, setNewDoorPersonName] = useState("")
  const [newDoorPersonEmail, setNewDoorPersonEmail] = useState("")

  // Promoter management functions
  const addPromoter = useCallback(() => {
    if (newPromoterName.trim() && newPromoterEmail.trim() && newPromoterPayout.trim()) {
      const newPromoter = {
        id: Date.now().toString(),
        name: newPromoterName.trim(),
        email: newPromoterEmail.trim(),
        payoutPercentage: newPromoterPayout.trim()
      }
      setSavedPromoters(prev => [...prev, newPromoter])
      setNewPromoterName("")
      setNewPromoterEmail("")
      setNewPromoterPayout("")
    }
  }, [newPromoterName, newPromoterEmail, newPromoterPayout])

  const removePromoter = useCallback((id: string) => {
    setSavedPromoters(prev => prev.filter(promoter => promoter.id !== id))
  }, [])

  // Door person management functions
  const addDoorPerson = useCallback(() => {
    if (newDoorPersonName.trim() && newDoorPersonEmail.trim()) {
      const newDoorPerson = {
        id: Date.now().toString(),
        name: newDoorPersonName.trim(),
        email: newDoorPersonEmail.trim()
      }
      setSavedDoorPersons(prev => [...prev, newDoorPerson])
      setNewDoorPersonName("")
      setNewDoorPersonEmail("")
    }
  }, [newDoorPersonName, newDoorPersonEmail])

  const removeDoorPerson = useCallback((id: string) => {
    setSavedDoorPersons(prev => prev.filter(doorPerson => doorPerson.id !== id))
  }, [])

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Location Settings</h3>
      
      <Card className="p-4 bg-card border-border">
        <h4 className="font-semibold text-foreground mb-4">Venue Information</h4>
        <div className="space-y-3">
          <div>
            <Label className="text-foreground">Venue Name</Label>
            <Input placeholder="The Blue Note" className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground">Address</Label>
            <Input placeholder="123 Music Street, New York, NY" className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground">Capacity</Label>
            <Input placeholder="100" type="number" className="mt-1 bg-input border-border text-foreground" />
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
        <h4 className="font-semibold text-foreground mb-4">Manage Promoters</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-sm text-foreground">Promoter Name</Label>
              <Input 
                placeholder="Enter promoter name" 
                value={newPromoterName}
                onChange={(e) => setNewPromoterName(e.target.value)}
                className="mt-1 bg-input border-border text-foreground" 
              />
            </div>
            <div>
              <Label className="text-sm text-foreground">Email Address</Label>
              <Input 
                placeholder="Enter email address" 
                type="email"
                value={newPromoterEmail}
                onChange={(e) => setNewPromoterEmail(e.target.value)}
                className="mt-1 bg-input border-border text-foreground" 
              />
            </div>
            <div>
              <Label className="text-sm text-foreground">Payout %</Label>
              <Input 
                placeholder="e.g. 20" 
                type="number"
                min="0"
                max="100"
                value={newPromoterPayout}
                onChange={(e) => setNewPromoterPayout(e.target.value)}
                className="mt-1 bg-input border-border text-foreground" 
              />
            </div>
          </div>
          <Button 
            onClick={addPromoter}
            disabled={!newPromoterName.trim() || !newPromoterEmail.trim() || !newPromoterPayout.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Promoter
          </Button>
          
          {savedPromoters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Saved Promoters</Label>
              <div className="space-y-2">
                {savedPromoters.filter(promoter => promoter.id && promoter.id.trim() !== "").map((promoter) => (
                  <div key={promoter.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{promoter.name}</div>
                      <div className="text-sm text-muted-foreground">{promoter.email}</div>
                      <div className="text-sm text-green-600 font-medium">{promoter.payoutPercentage}% payout</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePromoter(promoter.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-card border-border">
        <h4 className="font-semibold text-foreground mb-4">Manage Door Persons</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-foreground">Door Person Name</Label>
              <Input 
                placeholder="Enter door person name" 
                value={newDoorPersonName}
                onChange={(e) => setNewDoorPersonName(e.target.value)}
                className="mt-1 bg-input border-border text-foreground" 
              />
            </div>
            <div>
              <Label className="text-sm text-foreground">Email Address</Label>
              <Input 
                placeholder="Enter email address" 
                type="email"
                value={newDoorPersonEmail}
                onChange={(e) => setNewDoorPersonEmail(e.target.value)}
                className="mt-1 bg-input border-border text-foreground" 
              />
            </div>
          </div>
          <Button 
            onClick={addDoorPerson}
            disabled={!newDoorPersonName.trim() || !newDoorPersonEmail.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Door Person
          </Button>
          
          {savedDoorPersons.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Saved Door Persons</Label>
              <div className="space-y-2">
                {savedDoorPersons.filter(doorPerson => doorPerson.id && doorPerson.id.trim() !== "").map((doorPerson) => (
                  <div key={doorPerson.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{doorPerson.name}</div>
                      <div className="text-sm text-muted-foreground">{doorPerson.email}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDoorPerson(doorPerson.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
