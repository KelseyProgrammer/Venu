# Calendar Event Status Standard

## Overview
This document defines the gold standard for implementing event status logic in calendar views across all dashboards (Artist, Location, and Promoter). The implementation provides clear visual indicators and consistent behavior for event categorization.

## Event Status Definitions

### 1. PAST Event
- **Definition**: An event before today that is in the past
- **Status Code**: `"completed"`
- **Visual Indicators**:
  - Border: Gray (`border-gray-300`)
  - Text: Gray (`text-gray-600`)
  - Background: Gray (`bg-gray-200`)
  - Text Color: Dark Gray (`text-gray-800`)
- **Display Text**: `"Past (X/Y)"` where X = confirmed bands, Y = expected bands

### 2. COMPLETED Event
- **Definition**: An event where the number of bands equals the expected number of bands (`bands.length === numberOfBands`)
- **Status Code**: `"confirmed"`
- **Visual Indicators**:
  - Border: Green (`border-green-200`)
  - Text: Green (`text-green-600`)
  - Background: Light Green (`bg-green-200`)
  - Text Color: Dark Green (`text-green-800`)
- **Display Text**: `"Complete (X/Y)"` where X = confirmed bands, Y = expected bands

### 3. NEEDS BAND Event
- **Definition**: An event that still needs more bands (`bands.length < numberOfBands`)
- **Status Code**: `"pending"`
- **Visual Indicators**:
  - Border: Yellow (`border-yellow-200`)
  - Text: Yellow (`text-yellow-600`)
  - Background: Light Yellow (`bg-yellow-200`)
  - Text Color: Dark Yellow (`text-yellow-800`)
- **Display Text**: `"Need X more"` where X = number of bands still needed

## Implementation Requirements

### Data Structure
```typescript
interface Booking {
  id: number
  location: string
  date: string
  time: string
  status: "confirmed" | "pending" | "completed"
  ticketsSold: number
  totalTickets: number
  earnings: number
  image: string
  gigId?: string
  eventName?: string
  genre?: string
  artistSetTime?: string
  artistPercentage?: number
  artistGuarantee?: number
  isPast?: boolean
  confirmedBands?: number  // Required for band count display
  expectedBands?: number    // Required for band count display
}
```

### Status Logic Implementation
```typescript
// Determine event status based on requirements:
// PAST: event before today
// COMPLETED: bands.length === numberOfBands
// NEEDS BAND: bands.length < numberOfBands
const eventDate = new Date(gig.eventDate);
const today = new Date();
today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
eventDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

let status: "confirmed" | "pending" | "completed" = "pending";

if (eventDate < today) {
  // PAST event: event before today
  status = "completed";
} else if (gig.bands.length === gig.numberOfBands) {
  // COMPLETED event: number of bands equals expected bands
  status = "confirmed";
} else {
  // NEEDS BAND event: still needs more bands
  status = "pending";
}
```

### Calendar Filtering Logic
```typescript
// For schedule filters, only show dates that match the filter
let shouldShowDate = true
if (scheduleFilter !== "all") {
  if (scheduleFilter === "confirmed") {
    // COMPLETED events: bands.length === numberOfBands
    shouldShowDate = bookingOnDate?.status === "confirmed"
  } else if (scheduleFilter === "needs-band") {
    // NEEDS BAND events: bands.length < numberOfBands
    shouldShowDate = bookingOnDate?.status === "pending"
  } else if (scheduleFilter === "past") {
    // PAST events: event before today
    shouldShowDate = bookingOnDate?.status === "completed"
  }
}
```

### Visual Styling Implementation
```typescript
// Calendar day border styling
className={`h-20 p-2 rounded-lg border transition-all duration-200 ${
  bookingOnDate && bookingOnDate.status === "confirmed"
    ? 'bg-white border-green-200' // COMPLETED: lineup is complete
    : bookingOnDate && bookingOnDate.status === "completed"
    ? 'bg-white border-gray-300' // PAST: event is in the past
    : bookingOnDate && bookingOnDate.status === "pending"
    ? 'bg-white border-yellow-200' // NEEDS BAND: still needs more bands
    : // ... other styling
}`}

// Calendar day text styling
className={`text-sm font-medium mb-1 relative z-10 ${
  bookingOnDate && bookingOnDate.status === "confirmed"
    ? 'text-green-600' // COMPLETED: lineup is complete
    : bookingOnDate && bookingOnDate.status === "completed"
    ? 'text-gray-600' // PAST: event is in the past
    : bookingOnDate && bookingOnDate.status === "pending"
    ? 'text-yellow-600' // NEEDS BAND: still needs more bands
    : // ... other styling
}`}

// Event details display styling
className={`text-xs p-1 rounded truncate ${
  bookingOnDate.status === "confirmed"
    ? 'bg-green-200 text-green-800' // COMPLETED: lineup is complete
    : bookingOnDate.status === "completed"
    ? 'bg-gray-200 text-gray-800' // PAST: event is in the past
    : 'bg-yellow-200 text-yellow-800' // NEEDS BAND: still needs more bands
}`}

// Event details text content
{bookingOnDate.status === "confirmed" 
  ? `Complete (${bookingOnDate.confirmedBands}/${bookingOnDate.expectedBands})`
  : bookingOnDate.status === "completed"
  ? `Past (${bookingOnDate.confirmedBands}/${bookingOnDate.expectedBands})`
  : `Need ${(bookingOnDate.expectedBands || 0) - (bookingOnDate.confirmedBands || 0)} more`
}
```

## Dashboard-Specific Considerations

### Artist Dashboard
- **Reference Implementation**: `src/components/artist-dashboard.tsx`
- **Key Features**: Shows artist's own bookings with band lineup status
- **Filter Options**: All, Confirmed (Complete), Needs Band, Past

### Location Dashboard
- **Target Files**: 
  - `src/components/location-dashboard/schedule-calendar-view.tsx`
  - `src/components/location-dashboard/schedule-list-view.tsx`
- **Key Features**: Shows all events at the location with band lineup status
- **Filter Options**: All, Confirmed (Complete), Needs Band, Past

### Promoter Dashboard
- **Target Files**:
  - `src/components/promoter-dashboard/schedule-calendar-view.tsx`
  - `src/components/promoter-dashboard/schedule-list-view.tsx`
- **Key Features**: Shows all events promoted by the promoter with band lineup status
- **Filter Options**: All, Confirmed (Complete), Needs Band, Past

## Additional Styling Standards

### Available Dates
- **Text Color**: Black (`text-black`) for better readability
- **Exception**: White (`text-white`) for today's date to maintain contrast against purple background

### Filter Button Styling
- **All non-navigation buttons**: Purple variant with white font
- **Active filter**: Highlighted with purple background
- **Inactive filter**: Outline variant

## Testing Scenarios

### Test Cases
1. **Past Event**: Event date before today → Should show as "Past (X/Y)"
2. **Complete Event**: Event with full lineup → Should show as "Complete (X/Y)"
3. **Incomplete Event**: Event missing bands → Should show as "Need X more"
4. **Filter Functionality**: Each filter should show only matching events
5. **Visual Consistency**: Colors and styling should match across all dashboards

### Edge Cases
- Events with 0 bands (should show as "Need X more")
- Events with more bands than expected (should show as "Complete")
- Events on today's date (should not be considered "past")

## Migration Checklist

When implementing this standard in other dashboards:

- [ ] Update data transformation logic to include `confirmedBands` and `expectedBands`
- [ ] Implement the three-tier status logic (PAST, COMPLETED, NEEDS BAND)
- [ ] Update calendar filtering logic
- [ ] Apply consistent visual styling (colors, borders, text)
- [ ] Update event display text with band counts
- [ ] Test all filter combinations
- [ ] Verify visual consistency with artist dashboard
- [ ] Update any related documentation

## Files Modified in Reference Implementation

- `src/components/artist-dashboard.tsx`
  - Updated `Booking` interface
  - Modified `myBookings` transformation logic
  - Updated calendar filtering logic
  - Enhanced visual styling and event display

## Future Enhancements

- Consider adding tooltips with more detailed event information
- Implement real-time updates when band lineup changes
- Add animation transitions for status changes
- Consider accessibility improvements (ARIA labels, color contrast)
