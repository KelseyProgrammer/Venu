export default function TicketPurchase({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Purchase Ticket</h1>
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Event #{params.id}</h2>
          <p className="text-muted-foreground mb-6">This is a demo ticket purchase page.</p>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Ticket Price:</span>
              <span className="font-semibold">$25.00</span>
            </div>
            <div className="flex justify-between">
              <span>Service Fee:</span>
              <span className="font-semibold">$2.50</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-lg">$27.50</span>
            </div>
          </div>
          <button className="w-full mt-6 bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium">
            Purchase Ticket
          </button>
        </div>
      </div>
    </div>
  )
} 