export default function DoorScanner() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Door Scanner</h1>
        <div className="p-6 bg-card rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Scan Ticket</h2>
          <p className="text-muted-foreground mb-6">Scan or enter ticket code to validate entry.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Enter ticket code or scan barcode"
              className="w-full p-3 border rounded-lg bg-input"
            />
            <button className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium">
              Validate Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
