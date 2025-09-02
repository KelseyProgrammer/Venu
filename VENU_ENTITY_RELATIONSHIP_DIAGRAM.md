# VENU Entity Relationship Diagram & Data Flow Chart

## Entity Relationship Diagram (ERD)

This diagram shows the relationships between all entities in the VENU system, demonstrating how artist information comes from the Artist entity and gig information comes from Location and Dashboard entities.

```mermaid
erDiagram
    USER {
        string _id PK
        string email UK
        string password
        string role "fan|artist|promoter|door|location"
        string firstName
        string lastName
        string phone
        string profileImage
        boolean isVerified
        date createdAt
        date updatedAt
    }

    ARTIST {
        string _id PK
        string name
        string bio
        array genre
        string profileImage
        string email
        string phone
        string instagram
        string spotify
        string appleMusic
        string website
        string location
        string availability
        string priceRange
        number rating
        string followers
        number totalGigs
        number totalEarnings
        ObjectId userId FK
        boolean isActive
        boolean isVerified
        date createdAt
        date updatedAt
    }

    LOCATION {
        string _id PK
        string name
        string address
        string city
        string state
        string zipCode
        string country
        number capacity
        string description
        array amenities
        string contactPerson
        string contactEmail
        string contactPhone
        array images
        number rating
        array tags
        boolean isActive
        ObjectId createdBy FK
        array authorizedPromoters FK
        date createdAt
        date updatedAt
    }

    GIG {
        string _id PK
        string eventName
        date eventDate
        string eventTime
        string eventGenre
        number ticketCapacity
        number ticketPrice
        ObjectId selectedLocation FK
        ObjectId selectedPromoter FK
        string promoterEmail
        number promoterPercentage
        ObjectId selectedDoorPerson FK
        string doorPersonEmail
        array requirements
        array bands
        number guarantee
        number numberOfBands
        string status "draft|posted|live|completed"
        number rating
        array tags
        number ticketsSold
        string image
        object bonusTiers
        ObjectId createdBy FK
        date createdAt
        date updatedAt
    }

    %% Relationships
    USER ||--o| ARTIST : "has profile"
    USER ||--o{ LOCATION : "creates/owns"
    USER ||--o{ GIG : "creates"
    LOCATION ||--o{ GIG : "hosts"
    USER ||--o{ GIG : "promotes"
    USER ||--o{ GIG : "door person"
    LOCATION ||--o{ USER : "authorizes promoters"
```

## Data Flow Chart

This diagram shows how data flows through the VENU system, specifically demonstrating that ALL artist information comes from the Artist entity and ALL gig information comes from Location and Dashboard entities.

```mermaid
flowchart TD
    %% Data Sources
    A[Artist Entity] --> B[Artist Information]
    C[Location Entity] --> D[Location Information]
    E[Gig Entity] --> F[Gig Information]
    G[User Entity] --> H[User Information]

    %% Artist Data Flow
    B --> I[Artist Dashboard]
    B --> J[Artist API Routes]
    B --> K[Artist Profile Display]
    B --> L[Artist Search Results]
    B --> M[Artist Applications]

    %% Location Data Flow
    D --> N[Location Dashboard]
    D --> O[Location API Routes]
    D --> P[Gig Creation Form]
    D --> Q[Location Selection]
    D --> R[Venue Information Display]

    %% Gig Data Flow
    F --> S[Gig Dashboard Views]
    F --> T[Gig API Routes]
    F --> U[Gig Details Display]
    F --> V[Gig Schedule Views]
    F --> W[Gig Analytics]

    %% User Data Flow
    H --> X[Authentication]
    H --> Y[User Profiles]
    H --> Z[Role-based Access]

    %% Dashboard Integration
    I --> AA[Artist Dashboard Components]
    N --> BB[Location Dashboard Components]
    S --> CC[Promoter Dashboard Components]
    S --> DD[Fan Dashboard Components]

    %% API Integration
    J --> EE[Frontend API Calls]
    O --> EE
    T --> EE

    %% Real-time Updates
    EE --> FF[Socket.IO Real-time Updates]
    FF --> AA
    FF --> BB
    FF --> CC
    FF --> DD

    %% Data Relationships
    B -.->|"Referenced in"| F
    D -.->|"Referenced in"| F
    H -.->|"Owns/Creates"| B
    H -.->|"Owns/Creates"| D
    H -.->|"Creates"| F

    %% Styling
    classDef artistData fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef locationData fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef gigData fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef userData fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef dashboard fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class A,B,I,J,K,L,M artistData
    class C,D,N,O,P,Q,R locationData
    class E,F,S,T,U,V,W gigData
    class G,H,X,Y,Z userData
    class AA,BB,CC,DD dashboard
```

## Key Relationships and Data Flow

### Artist Information Flow
- **Source**: Artist Entity (`backend/src/models/Artist.ts`)
- **API Routes**: `/api/artists/*` (`backend/src/routes/artists.routes.ts`)
- **Frontend Integration**: `src/lib/api.ts` - `artistApi` functions
- **Dashboard Display**: `src/components/artist-dashboard.tsx`
- **Data Includes**: Name, bio, genre, contact info, social media, location, availability, pricing, ratings, metrics

### Location Information Flow
- **Source**: Location Entity (`backend/src/models/Location.ts`)
- **API Routes**: `/api/locations/*` (`backend/src/routes/locations.routes.ts`)
- **Frontend Integration**: `src/lib/api.ts` - location-related functions
- **Dashboard Display**: `src/components/location-dashboard/`
- **Data Includes**: Venue details, capacity, amenities, contact info, authorized promoters

### Gig Information Flow
- **Source**: Gig Entity (`backend/src/models/Gig.ts`)
- **API Routes**: `/api/gigs/*` (`backend/src/routes/gigs.routes.ts`)
- **Frontend Integration**: `src/lib/api.ts` - `gigApi` functions
- **Dashboard Display**: Multiple dashboards (promoter, location, fan, artist)
- **Data Includes**: Event details, bands, requirements, pricing, status, analytics

### User Information Flow
- **Source**: User Entity (`backend/src/models/User.ts`)
- **API Routes**: `/api/auth/*` and user-related routes
- **Frontend Integration**: Authentication and role-based access
- **Dashboard Display**: User profiles and role-specific dashboards
- **Data Includes**: Authentication, roles, personal information

## Data Flow Summary

1. **Artist Information**: Flows exclusively from the Artist entity through API routes to artist dashboards and displays
2. **Gig Information**: Flows from the Gig entity (which references Location and User entities) to all dashboard types
3. **Location Information**: Flows from the Location entity to location dashboards and gig creation forms
4. **User Information**: Flows from the User entity to provide authentication and role-based access control

The system ensures data integrity by maintaining clear entity relationships and using proper foreign key references between entities.
