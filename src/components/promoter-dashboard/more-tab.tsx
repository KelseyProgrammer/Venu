"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Building2, TrendingUp, Users, DollarSign, Plus, User } from "lucide-react"
import Image from "next/image"
import { ProfileManagement } from "@/components/ui/profile-management"

export function MoreTab() {
  const [moreSubcategory, setMoreSubcategory] = useState("analytics")
  const [newDoorPersonName, setNewDoorPersonName] = useState("")
  const [newDoorPersonEmail, setNewDoorPersonEmail] = useState("")
  const [savedDoorPersons, setSavedDoorPersons] = useState<Array<{ id: string; name: string; email: string }>>([])

  const filteredLocations = useMemo(() => [
    { id: "muggys", name: "Muggsy's", revenue: "$2,500", image: "/images/MUGS.jpeg", location: "St. Augustine, FL", eventsCount: 12 },
    { id: "sarbez", name: "Sarbez", revenue: "$1,800", image: "/images/SARBEZ.jpg", location: "St. Augustine, FL", eventsCount: 8 },
    { id: "alfreds", name: "Alfred's", revenue: "$3,200", image: "/images/Alfreds.jpg", location: "St. Augustine, FL", eventsCount: 15 }
  ], [])
  const filteredUpcomingEvents = useMemo(() => [
    {
      id: 1,
      name: "Rock Night",
      date: "2024-12-15",
      location: "Muggsy's",
      status: "confirmed",
      ticketsSold: 45
    },
    {
      id: 2,
      name: "Jazz Evening",
      date: "2024-12-20",
      location: "Sarbez",
      status: "pending",
      ticketsSold: 32
    }
  ], [])

  const addDoorPerson = () => {
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
  }

  const removeDoorPerson = (id: string) => {
    setSavedDoorPersons(prev => prev.filter(person => person.id !== id))
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="font-serif font-bold text-xl">More</h2>
      
      {/* Subcategory Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={moreSubcategory === "analytics" ? "default" : "outline"} 
          size="sm"
          onClick={() => setMoreSubcategory("analytics")}
          className={`whitespace-nowrap ${moreSubcategory === "analytics" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          Analytics
        </Button>
        <Button 
          variant={moreSubcategory === "settings" ? "default" : "outline"} 
          size="sm"
          onClick={() => setMoreSubcategory("settings")}
          className={`whitespace-nowrap ${moreSubcategory === "settings" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <Building2 className="w-4 h-4 mr-1" />
          Settings
        </Button>
        <Button 
          variant={moreSubcategory === "reports" ? "default" : "outline"} 
          size="sm"
          onClick={() => setMoreSubcategory("reports")}
          className={`whitespace-nowrap ${moreSubcategory === "reports" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          Reports
        </Button>
        <Button 
          variant={moreSubcategory === "support" ? "default" : "outline"} 
          size="sm"
          onClick={() => setMoreSubcategory("support")}
          className={`whitespace-nowrap ${moreSubcategory === "support" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <Users className="w-4 h-4 mr-1" />
          Support
        </Button>
        <Button 
          variant={moreSubcategory === "profile" ? "default" : "outline"} 
          size="sm"
          onClick={() => setMoreSubcategory("profile")}
          className={`whitespace-nowrap ${moreSubcategory === "profile" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <User className="w-4 h-4 mr-1" />
          Profile
        </Button>
      </div>

      {/* Profile Subcategory */}
      {moreSubcategory === "profile" && (
        <ProfileManagement
          userType="promoter"
          initialData={{
            firstName: "John",
            lastName: "Doe",
            email: "promoter@venu.com",
            phone: "+1 (555) 987-6543",
            company: "VENU Promotions",
            location: "St. Augustine, FL",
            bio: "Experienced promoter with a passion for live music and community events."
          }}
          onSave={(data) => {
            console.log('Profile saved:', data)
            // In a real implementation, you would save this to the backend
          }}
        />
      )}

      {/* Analytics Subcategory */}
      {moreSubcategory === "analytics" && (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg text-foreground">Analytics</h3>

          {/* Overall Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">92%</div>
              <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                ${filteredLocations.reduce((sum, location) => {
                  const revenue = location.revenue ? parseFloat(location.revenue.replace(/[$,]/g, '')) : 0
                  return sum + revenue
                }, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </Card>
            <Card className="p-4 bg-card border-border text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {filteredUpcomingEvents.reduce((sum, event) => sum + event.ticketsSold, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Tickets Sold</div>
            </Card>
          </div>

          {/* Location Performance Comparison */}
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-4">Location Performance</h4>
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <div key={location.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image
                      src={location.image}
                      alt={location.name}
                      width={32}
                      height={32}
                      className="rounded-lg object-cover w-8 h-8"
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">{location.name}</span>
                      <div className="text-xs text-muted-foreground">{location.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-foreground">{location.eventsCount}</div>
                      <div className="text-muted-foreground">Events</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-400">{location.revenue}</div>
                      <div className="text-muted-foreground">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">85%</div>
                      <div className="text-muted-foreground">Fill Rate</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Genre Performance */}
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-4">Genre Performance Across Locations</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Jazz</span>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">88%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Rock</span>
                <div className="flex items-center gap-2">
                  <Progress value={72} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Electronic</span>
                <div className="flex items-center gap-2">
                  <Progress value={65} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Folk</span>
                <div className="flex items-center gap-2">
                  <Progress value={78} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Trends */}
          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-4">Monthly Trends</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Revenue growth</span>
                <span className="text-green-400">+18% vs last month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event count</span>
                <span className="text-blue-400">+5 new events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Artist applications</span>
                <span className="text-yellow-400">+23% increase</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average rating</span>
                <span className="text-foreground">4.7/5.0</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Settings Subcategory */}
      {moreSubcategory === "settings" && (
        <Card className="p-4 bg-card border-border">
          <h3 className="font-semibold text-foreground mb-4">Manage Door Persons</h3>
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
                  {savedDoorPersons.map((doorPerson) => (
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
      )}

      {/* Reports Subcategory */}
      {moreSubcategory === "reports" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Reports</h3>
          
          <div className="grid gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Monthly Revenue Report</h4>
                  <p className="text-sm text-muted-foreground">Detailed breakdown of earnings and expenses</p>
                </div>
                <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Download
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Artist Performance Report</h4>
                  <p className="text-sm text-muted-foreground">Attendance and satisfaction metrics by artist</p>
                </div>
                <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Download
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Event History</h4>
                  <p className="text-sm text-muted-foreground">Complete list of past events and outcomes</p>
                </div>
                <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  View
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Support Subcategory */}
      {moreSubcategory === "support" && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg text-foreground">Support</h3>
          
          <div className="grid gap-4">
            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Help Center</h4>
                  <p className="text-sm text-muted-foreground">Browse our knowledge base and FAQs</p>
                </div>
                <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Visit
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Contact Support</h4>
                  <p className="text-sm text-muted-foreground">Get help from our support team</p>
                </div>
                <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Contact
                </Button>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Feature Requests</h4>
                  <p className="text-sm text-muted-foreground">Suggest new features and improvements</p>
                </div>
                <Button variant="default" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Submit
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
