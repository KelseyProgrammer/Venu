"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Building2, TrendingUp, Users } from "lucide-react"
import { MoreAnalytics } from "./more-analytics"
import { MoreSettings } from "./more-settings"
import { MoreReports } from "./more-reports"
import { MoreSupport } from "./more-support"

export function MoreTab() {
  const [moreSubcategory, setMoreSubcategory] = useState("analytics")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl">More</h2>
      </div>

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
      </div>

      {/* Analytics Subcategory */}
      {moreSubcategory === "analytics" && <MoreAnalytics />}

      {/* Settings Subcategory */}
      {moreSubcategory === "settings" && <MoreSettings />}

      {/* Reports Subcategory */}
      {moreSubcategory === "reports" && <MoreReports />}

      {/* Support Subcategory */}
      {moreSubcategory === "support" && <MoreSupport />}
    </div>
  )
}
