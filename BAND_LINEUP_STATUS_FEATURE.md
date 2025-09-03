# Band Lineup Status Feature

## Overview
This feature allows events to display a band lineup status showing how many bands are confirmed vs. how many are still needed. Events with incomplete lineups show orange placeholder slots and status indicators.

## Features

### 1. Event Cards
- Display band lineup status: "1/3 Bands" 
- Show orange indicator when bands are still needed: "2 needed"
- Status updates in real-time as bands are added

### 2. Event Details Modal
- Shows confirmed bands with green checkmarks
- Displays orange placeholder slots for bands still needed
- Status indicator: "2 more needed" with orange styling

### 3. Manage Event Modal
- Add bands via the "Manage" button
- Bands are automatically marked as confirmed when added
- Real-time status updates as bands are added/removed

### 4. Post Gig Flow
- Set expected number of bands during gig creation
- Shows progress indicator: "Added so far: 1/3 bands"
- Orange warning for bands still needed

## Technical Implementation

### Data Model Changes
- Added `confirmed?: boolean` field to Band interface
- Backend schema updated to include `confirmed` field with default `true`

### UI Components Updated
- `EventCard`: Added band lineup status display
- `EventDetailsModal`: Added placeholder slots for missing bands
- `ManageEventModal`: Bands marked as confirmed when added
- `PostGigFlow`: Uses user-specified numberOfBands instead of bands.length

### Status Indicators
- **Green**: Complete lineup (all bands confirmed)
- **Orange**: Incomplete lineup (bands still needed)
- **Placeholder slots**: Orange styling with "Band Slot Available" text

## Usage Example

1. **Create an event** with 3 expected bands
2. **Add 1 band** during creation
3. **View the event** - shows "1/3 Bands" with "2 needed" indicator
4. **Click "Manage"** to add more bands
5. **Add 2 more bands** - status updates to "3/3 Bands" with green indicator

## Files Modified
- `src/lib/types.ts` - Added confirmed field to Band interface
- `src/components/event-card.tsx` - Added band lineup status display
- `src/components/location-dashboard/event-details-modal.tsx` - Added placeholder slots
- `src/components/location-dashboard/manage-event-modal.tsx` - Mark bands as confirmed
- `src/components/location-dashboard/post-gig-flow.tsx` - Use numberOfBands field
- `src/components/promoter-dashboard/post-gig-flow.tsx` - Use numberOfBands field
- `src/components/fan-dashboard.tsx` - Pass band data to event cards
- `backend/src/types.ts` - Added confirmed field to Band interface
- `backend/src/models/Gig.ts` - Added confirmed field to band schema
