import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' },
      { status: 400 }
    )
  }

  // Clean the username (remove @ if present)
  const cleanUsername = username.replace('@', '')

  try {
    // Method 1: Try to fetch from Instagram's public data
    // Note: This is a simplified approach. In production, you'd want to use
    // Instagram's official API with proper authentication
    
    const response = await fetch(`https://www.instagram.com/${cleanUsername}/?__a=1&__d=dis`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (response.ok) {
      try {
        const data = await response.json()
        
        // Extract follower count from the response
        if (data.graphql?.user?.edge_followed_by?.count) {
          const followers = data.graphql.user.edge_followed_by.count
          return NextResponse.json({
            success: true,
            followers: formatFollowerCount(followers),
            rawCount: followers
          })
        }
      } catch (jsonError) {
        // If JSON parsing fails, try HTML parsing
        console.log('JSON parsing failed, trying HTML parsing...')
      }
    }

    // Method 2: Try HTML parsing as fallback
    try {
      const htmlResponse = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      })

      if (htmlResponse.ok) {
        const html = await htmlResponse.text()
        
        // Try to extract follower count from meta tags or script tags
        const metaMatch = html.match(/"edge_followed_by":\s*{\s*"count":\s*(\d+)/)
        if (metaMatch) {
          const followers = parseInt(metaMatch[1])
          return NextResponse.json({
            success: true,
            followers: formatFollowerCount(followers),
            rawCount: followers
          })
        }
      }
    } catch (htmlError) {
      console.log('HTML parsing failed:', htmlError)
    }

    // Method 3: Fallback - return a mock response with instructions
    // In a real implementation, you might use a third-party service or
    // implement more sophisticated scraping techniques
    
    return NextResponse.json({
      success: false,
      error: 'Unable to fetch Instagram followers automatically',
      message: 'Instagram has restricted public access to follower counts. Please enter your follower count manually.',
      suggestions: [
        'Enter your follower count manually in the profile form',
        'Use Instagram\'s official API (requires business account approval)',
        'Consider using a third-party social media analytics service'
      ],
      alternative: 'Enter follower count manually in your profile'
    })

  } catch (error) {
    console.error('Instagram API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Instagram data',
        message: 'Please enter your follower count manually',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to format follower count (e.g., 1234 -> "1.2K")
function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`
  } else {
    return count.toString()
  }
}
