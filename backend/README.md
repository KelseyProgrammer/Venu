# VENU Backend API

A Node.js/Express backend API for the VENU mobile LMS platform, built with TypeScript and MongoDB.

## Features

- **User Management**: Registration, authentication, and profile management
- **Event Management**: Create, read, update, and delete gigs/events
- **Location Management**: Venue and location management
- **Role-based Access Control**: Different user roles (fan, artist, promoter, door, location)
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Mongoose ODM with proper schemas and validation
- **RESTful API**: Clean, consistent API endpoints
- **TypeScript**: Full type safety and better development experience

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/venu_db

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (with pagination and filtering)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/role/:role` - Get users by role

### Gigs (Events)
- `POST /api/gigs` - Create new gig
- `GET /api/gigs` - Get all gigs (with pagination and filtering)
- `GET /api/gigs/:id` - Get gig by ID
- `PUT /api/gigs/:id` - Update gig
- `DELETE /api/gigs/:id` - Delete gig
- `GET /api/gigs/status/:status` - Get gigs by status
- `GET /api/gigs/creator/:userId` - Get gigs by creator

### Locations
- `POST /api/locations` - Create new location
- `GET /api/locations` - Get all locations (with pagination and filtering)
- `GET /api/locations/:id` - Get location by ID
- `PUT /api/locations/:id` - Update location
- `DELETE /api/locations/:id` - Delete location
- `GET /api/locations/search/area` - Search locations by area
- `GET /api/locations/search/capacity` - Search locations by capacity

## Database Models

### User
- Basic user information (name, email, phone)
- Role-based access control
- Password hashing with bcrypt
- Profile image support

### Gig (Event)
- Event details (name, date, time, genre)
- Band information and scheduling
- Location and promoter assignments
- Requirements and status tracking

### Location
- Venue information (name, address, capacity)
- Contact details and amenities
- Active/inactive status
- Search and filtering capabilities

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

All API responses follow a consistent format:
```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string
}
```

## Development

- **Development server**: `npm run dev` (uses nodemon for auto-reload)
- **Build**: `npm run build`
- **Production start**: `npm start`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include TypeScript types
4. Test your changes
5. Update documentation as needed