export default function VenueDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Venue Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Upcoming Events</h3>
            <p className="text-muted-foreground">No events scheduled</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-muted-foreground">$0.00 this month</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Bookings</h3>
            <p className="text-muted-foreground">0 pending bookings</p>
          </div>
        </div>
      </div>
    </div>
  )
}
