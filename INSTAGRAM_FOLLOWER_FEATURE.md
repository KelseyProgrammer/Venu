# Instagram Follower Count Feature

## Overview
This feature automatically extracts and displays Instagram follower counts for artists on their profile cards. When an artist enters their Instagram username in the profile creation form, the system attempts to fetch their follower count automatically.

## How It Works

### 1. Artist Profile Form
- Artists can enter their Instagram username in the profile creation/editing form
- The system automatically attempts to fetch follower count when the field loses focus
- A manual "Get Followers" button is also available
- If automatic fetching fails, artists can manually enter their follower count

### 2. Instagram API Endpoint
- Located at `/api/instagram/followers`
- Attempts multiple methods to fetch follower counts:
  - **Method 1**: Instagram's JSON endpoint (`/?__a=1&__d=dis`)
  - **Method 2**: HTML parsing fallback
  - **Method 3**: Manual entry fallback with helpful instructions

### 3. Data Storage
- Follower count is stored in the `followers` field of the Artist model
- Formatted as human-readable strings (e.g., "1.2K", "5.5M", "1234")
- Displayed on all artist cards throughout the application

## Technical Implementation

### Frontend Components
- `ArtistProfileForm`: Handles Instagram username input and follower fetching
- `ArtistListing`: Displays follower count on artist cards
- API integration in `/lib/api.ts`

### Backend
- Artist model already includes `followers` field
- Artist routes handle follower count in create/update operations
- Data validation and sanitization

### API Endpoint
- Robust error handling for Instagram's changing API
- Multiple fallback methods
- Proper HTTP headers and caching
- Rate limiting considerations

## User Experience

### For Artists
1. Enter Instagram username in profile form
2. System automatically fetches follower count
3. If automatic fetch fails, manually enter count
4. Follower count appears on their artist card

### For Venues/Fans
1. Browse artist listings
2. See follower count displayed on each artist card
3. Use follower count as a social proof metric

## Limitations & Considerations

### Instagram API Restrictions
- Instagram has restricted public access to follower data
- Official API requires business account approval
- Web scraping may be blocked or rate-limited

### Fallback Strategy
- Manual entry option always available
- Clear error messages guide users
- Multiple parsing methods for reliability

### Performance
- API responses cached for 1 hour
- Graceful degradation when services unavailable
- Minimal impact on page load times

## Future Enhancements

### Possible Improvements
1. Integration with Instagram's official API (requires business approval)
2. Third-party social media analytics services
3. Periodic automatic updates of follower counts
4. Analytics dashboard showing follower growth over time

### Alternative Services
- Social Blade API
- HypeAuditor
- Social Media APIs (Twitter, TikTok, etc.)

## Testing

### Manual Testing
1. Create artist profile with Instagram username
2. Verify automatic follower fetch
3. Test manual entry fallback
4. Check display on artist cards

### API Testing
```javascript
// Test the Instagram API endpoint
const response = await fetch('/api/instagram/followers?username=instagram')
const data = await response.json()
console.log(data)
```

## Security & Privacy
- No Instagram credentials stored
- Public data only (no private account access)
- Rate limiting to prevent abuse
- Clear user consent and transparency
