"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Calendar } from "lucide-react"
import { ScheduleListView } from "./schedule-list-view"
import { ScheduleCalendarView } from "./schedule-calendar-view"
import { LocationProfile, GigProfile } from "@/lib/api"

interface ScheduleTabProps {
  locationId: string;
  location?: LocationProfile | null;
  gigs: GigProfile[];
  unavailableDates: string[];
  onToggleDateAvailability: (dateString: string) => void;
  onRefreshGigs: () => void;
}

export function ScheduleTab({ locationId, gigs, unavailableDates, onToggleDateAvailability, onRefreshGigs }: ScheduleTabProps) {
  const [scheduleSubcategory, setScheduleSubcategory] = useState("list")
  const [scheduleFilter, setScheduleFilter] = useState("all") // "all", "complete", "needs-bands", "unavailable", "past"

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">Schedule</h2>
      </div>

      {/* Schedule Subcategory Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={scheduleSubcategory === "list" ? "default" : "outline"} 
          size="sm"
          onClick={() => setScheduleSubcategory("list")}
          className={`whitespace-nowrap ${scheduleSubcategory === "list" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          List View
        </Button>
        <Button 
          variant={scheduleSubcategory === "calendar" ? "default" : "outline"} 
          size="sm"
          onClick={() => setScheduleSubcategory("calendar")}
          className={`whitespace-nowrap ${scheduleSubcategory === "calendar" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          <Calendar className="w-4 h-4 mr-1" />
          Calendar View
        </Button>
      </div>

      {/* Filter Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button 
          variant={scheduleFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setScheduleFilter("all")}
          className={`whitespace-nowrap ${scheduleFilter === "all" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
        >
          All Events
        </Button>
        <Button 
          variant={scheduleFilter === "complete" ? "default" : "outline"} 
          size="sm"
          onClick={() => setScheduleFilter("complete")}
          className={`whitespace-nowrap ${scheduleFilter === "complete" ? "bg-green-600 hover:bg-green-700 text-white" : "border-green-200 text-green-700 hover:bg-green-50"}`}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
          Complete
        </Button>
        <Button 
          variant={scheduleFilter === "needs-bands" ? "default" : "outline"} 
          size="sm"
          onClick={() => setScheduleFilter("needs-bands")}
          className={`whitespace-nowrap ${scheduleFilter === "needs-bands" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : "border-yellow-200 text-yellow-700 hover:bg-yellow-50"}`}
        >
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          Needs Bands
        </Button>
        <Button 
          variant={scheduleFilter === "past" ? "default" : "outline"} 
          size="sm"
          onClick={() => setScheduleFilter("past")}
          className={`whitespace-nowrap ${scheduleFilter === "past" ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
          Past
        </Button>
      </div>

      {/* List View Subcategory */}
      {scheduleSubcategory === "list" && (
        <ScheduleListView 
          scheduleFilter={scheduleFilter} 
          gigs={gigs}
          locationId={locationId}
          onRefreshGigs={onRefreshGigs}
        />
      )}

      {/* Calendar View Subcategory */}
      {scheduleSubcategory === "calendar" && (
        <ScheduleCalendarView 
          scheduleFilter={scheduleFilter}
          gigs={gigs}
          locationId={locationId}
          onRefreshGigs={onRefreshGigs}
          unavailableDates={unavailableDates}
          onToggleDateAvailability={onToggleDateAvailability}
          onFilterChange={setScheduleFilter}
        />
      )}
    </div>
  )
}
