"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Calendar, Users, Star, Music } from "lucide-react"
import { LocationAnalytics } from "@/hooks/useLocation"

interface MoreAnalyticsProps {
  analytics?: LocationAnalytics | null;
}

export function MoreAnalytics({ analytics }: MoreAnalyticsProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Location Analytics</h3>

      {analytics ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-card border-border text-center">
              <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{analytics.averageFillRate}%</div>
              <div className="text-sm text-muted-foreground">Avg Fill Rate</div>
            </Card>

            <Card className="p-4 bg-card border-border text-center">
              <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">${analytics.monthlyRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
            </Card>

            <Card className="p-4 bg-card border-border text-center">
              <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{analytics.totalGigs}</div>
              <div className="text-sm text-muted-foreground">Total Gigs</div>
            </Card>

            <Card className="p-4 bg-card border-border text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{analytics.upcomingGigs}</div>
              <div className="text-sm text-muted-foreground">Upcoming Gigs</div>
            </Card>
          </div>

          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-3">Top Genres</h4>
            <div className="space-y-2">
              {analytics.topGenres.map((genre) => (
                <div key={genre.genre} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{genre.genre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(genre.count / analytics.totalGigs) * 100} className="w-20" />
                    <span className="text-sm text-muted-foreground w-8 text-right">{genre.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <h4 className="font-semibold text-foreground mb-3">Performance Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-lg font-bold text-foreground">{analytics.averageRating}</span>
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">${analytics.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground">No analytics data available</div>
        </div>
      )}

    </div>
  )
}
