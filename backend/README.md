# VENU Backend API

A Node.js/Express backend API for the VENU mobile LMS platform, built with TypeScript and MongoDB.

## Features

- **User Management**: Registration, authentication, and profile management with role-based access
- **Event Management**: Create, read, update, and delete gigs/events with promoter controls
- **Location Management**: Venue and location management with search capabilities
- **Role-based Access Control**: Different user roles (fan, artist, promoter, door, location, admin)
- **JWT Authentication**: Secure token-based authentication with proper configuration
- **MongoDB Integration**: Mongoose ODM with optimized schemas, validation, and indexing
- **RESTful API**: Clean, consistent API endpoints with comprehensive validation
- **TypeScript**: Full type safety and better development experience
- **Input Validation**: Zod schemas for comprehensive request validation
- **Error Handling**: Typed error responses with proper logging and debugging
- **Rate Limiting**: Protection against abuse with configurable limits
- **Security**: Input sanitization, CORS protection, and secure password hashing

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

### Authentication (Rate Limited: 5 requests/15min)
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User login with secure authentication
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update user profile (Protected)

### Users (Admin Only)
- `GET /api/users` - Get all users with pagination and search
- `GET /api/users/:id` - Get user by ID (Owner or Admin)
- `PUT /api/users/:id` - Update user (Owner or Admin)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/by-role/:role` - Get users by role (Admin only)

### Gigs/Events (Rate Limited: 10 requests/15min for creation)
- `POST /api/gigs` - Create new gig (Promoter/Admin only)
- `GET /api/gigs` - Get all gigs with pagination and filtering
- `GET /api/gigs/:id` - Get gig by ID with populated data
- `PUT /api/gigs/:id` - Update gig (Owner/Admin only)
- `DELETE /api/gigs/:id` - Delete gig (Owner/Admin only)
- `GET /api/gigs/by-status/:status` - Get gigs by status
- `GET /api/gigs/by-creator/:userId` - Get gigs by creator (Protected)

### Locations (Rate Limited: 10 requests/15min for creation)
- `POST /api/locations` - Create new location (Location/Admin only)
- `GET /api/locations` - Get all locations with pagination and filtering
- `GET /api/locations/:id` - Get location by ID with populated data
- `PUT /api/locations/:id` - Update location (Owner/Admin only)
- `DELETE /api/locations/:id` - Delete location (Owner/Admin only)
- `GET /api/locations/search/area` - Search locations by city/state
- `GET /api/locations/search/capacity` - Search locations by capacity range

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

- **Password Security**: bcrypt hashing with 12 rounds minimum
- **JWT Authentication**: Secure token-based authentication with proper configuration
- **Role-based Access Control**: Granular permissions for different user roles
- **Input Validation**: Comprehensive Zod schema validation for all endpoints
- **Rate Limiting**: Protection against abuse with configurable limits per endpoint type
- **Error Handling**: Secure error responses that don't leak sensitive information
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Environment Variables**: Secure handling of sensitive configuration data
- **Input Sanitization**: Protection against injection attacks
- **Resource Ownership**: Users can only access and modify their own resources

## Performance Optimizations

- **Parallel Database Queries**: Use Promise.all() for concurrent operations
- **Lean Queries**: Use .lean() for read-only operations to reduce memory usage
- **Input Validation**: Validate and limit pagination parameters (max 100 items per page)
- **Secondary Sorting**: Include secondary sort fields for consistent results
- **Index-Aware Queries**: Structure queries to leverage existing database indexes
- **Memory Management**: Proper cleanup and avoid memory leaks in long-running processes
- **Query Optimization**: Efficient database queries with proper population and field selection

## Middleware & Validation

### Input Validation
All API endpoints use Zod schemas for comprehensive input validation:
- **Request Body Validation**: Validates all incoming data types and formats
- **Query Parameter Validation**: Ensures proper pagination and filtering parameters
- **Error Messages**: Provides clear, user-friendly validation error messages
- **Type Safety**: Full TypeScript integration with validated data

### Rate Limiting
Configurable rate limiting for different endpoint types:
- **Authentication**: 5 requests per 15 minutes
- **General API**: 100 requests per 15 minutes  
- **Create Operations**: 10 requests per 15 minutes
- **Strict Endpoints**: 20 requests per 15 minutes

### Error Handling
Comprehensive error handling with typed responses:
- **Custom Error Classes**: Specific error types for different scenarios
- **Consistent API Responses**: Standardized error response format
- **Logging**: Detailed error logging with context and user information
- **Security**: Error responses don't leak sensitive information

### Database Optimization
Optimized database performance with proper indexing:
- **Compound Indexes**: Indexes for common query patterns
- **Text Search**: MongoDB text indexes for search functionality
- **Query Optimization**: Efficient population and field selection
- **Pagination**: Optimized pagination for large datasets

## Contributing

1. Follow the existing code style and patterns
2. Add proper error handling with typed errors
3. Include comprehensive input validation with Zod schemas
4. Use proper TypeScript types throughout
5. Test your changes thoroughly
6. Update documentation as needed
7. Follow the security guidelines for authentication and authorization