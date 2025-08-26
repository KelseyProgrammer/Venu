# VENU Backend API - Node.js/Express Server

This is the backend API server for VENU, built with Node.js, Express.js, and TypeScript. It provides RESTful API endpoints for the live music venue booking platform.

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (Recommended: Node.js 20+)
- **npm** or **yarn** package manager
- **MongoDB** (for database, when implemented)
- **Git** for version control

### Installation

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run the development server:**
```bash
npm run dev
```

5. **The API will be available at:**
```
http://localhost:3001
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/                   # API route handlers
│   │   ├── loginRoutes.ts       # Authentication routes
│   │   └── users.routes.ts      # User management routes
│   ├── shared/                  # Shared backend utilities
│   │   └── types.ts            # Backend type definitions
│   ├── tests/                   # Test files
│   │   ├── integration test/    # Integration tests
│   │   └── unittest/           # Unit tests
│   ├── server.ts               # Express server setup
│   └── types.ts                # Main type definitions
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🛠️ Technology Stack

### Backend Framework
- **Node.js**: JavaScript runtime environment
- **Express.js 5.1.0**: Web application framework
- **TypeScript 5.9.2**: Type-safe development
- **ES Modules**: Modern JavaScript module system

### Database & Storage
- **MongoDB**: NoSQL database (via Mongoose)
- **Mongoose 8.17.1**: MongoDB object modeling
- **LRU Cache**: In-memory caching for performance

### Development Tools
- **tsx**: TypeScript execution for development
- **nodemon**: Auto-restart on file changes
- **ts-node**: TypeScript execution environment

### Key Dependencies
- **cors**: Cross-Origin Resource Sharing
- **dotenv**: Environment variable management
- **express-session**: Session management
- **url**: URL parsing utilities

## 📊 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server

### Testing
- `npm test` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:watch` - Run tests in watch mode

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /login` - User authentication
- `POST /logout` - User logout
- `POST /register` - User registration
- `GET /verify` - Token verification

### User Routes (`/api/users`)
- `GET /` - Get all users
- `GET /:id` - Get user by ID
- `POST /` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

### Event Routes (`/api/events`) - *To be implemented*
- `GET /` - Get all events
- `GET /:id` - Get event by ID
- `POST /` - Create new event
- `PUT /:id` - Update event
- `DELETE /:id` - Delete event

### Venue Routes (`/api/venues`) - *To be implemented*
- `GET /` - Get all venues
- `GET /:id` - Get venue by ID
- `POST /` - Create new venue
- `PUT /:id` - Update venue
- `DELETE /:id` - Delete venue

## 🗄️ Database Schema

### User Schema
```typescript
interface User {
  _id: string
  email: string
  password: string
  role: 'artist' | 'promoter' | 'venue' | 'fan' | 'door'
  profile: {
    name: string
    bio?: string
    image?: string
    contact?: {
      phone?: string
      social?: {
        instagram?: string
        twitter?: string
        facebook?: string
      }
    }
  }
  createdAt: Date
  updatedAt: Date
}
```

### Event Schema - *To be implemented*
```typescript
interface Event {
  _id: string
  name: string
  venue: string
  date: Date
  time: string
  genre: string
  capacity: number
  numberOfBands: number
  doorPerson: string
  guarantee: number
  bonusTiers: Array<{
    threshold: number
    bonus: number
    color: string
  }>
  requirements: Array<{
    id: string
    text: string
    checked: boolean
  }>
  bands: Array<{
    id: string
    name: string
    genre: string
    setTime: string
    percentage: number
    email: string
  }>
  status: 'draft' | 'published' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/venu
MONGODB_TEST_URI=mongodb://localhost:27017/venu_test

# Authentication
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### TypeScript Configuration
The project uses strict TypeScript configuration with:
- **Strict mode**: Enabled for type safety
- **ES Modules**: Modern module system
- **Path mapping**: Absolute imports with `@/` prefix
- **Source maps**: For debugging

## 🧪 Testing

### Test Structure
- **Unit Tests**: Test individual functions and modules
- **Integration Tests**: Test API endpoints and database interactions
- **Test Database**: Separate test database for isolated testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
# Build the project
npm run build

# Start production server
npm start
```

### Environment Setup
1. **Set production environment variables**
2. **Configure database connection**
3. **Set up reverse proxy (nginx)**
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

## 📚 API Documentation

### Request/Response Format
All API responses follow a consistent format:

```typescript
// Success Response
{
  success: true,
  data: any,
  message?: string
}

// Error Response
{
  success: false,
  error: string,
  details?: any
}
```

### Authentication
- **JWT Tokens**: For stateless authentication
- **Session Management**: For user sessions
- **Role-Based Access**: Different permissions for different user types

### Error Handling
- **HTTP Status Codes**: Proper status codes for different scenarios
- **Error Messages**: Clear, descriptive error messages
- **Validation**: Input validation with detailed error responses

## 🔒 Security

### Security Measures
- **CORS**: Configured for specific origins
- **Input Validation**: All inputs validated and sanitized
- **Authentication**: Secure user authentication
- **Rate Limiting**: API rate limiting (to be implemented)
- **HTTPS**: SSL/TLS encryption (in production)

### Best Practices
- **Environment Variables**: Sensitive data in environment variables
- **Password Hashing**: Secure password storage
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## 🤝 Contributing

When contributing to the backend:

1. **Follow TypeScript best practices**
2. **Write comprehensive tests**
3. **Document API endpoints**
4. **Follow RESTful API conventions**
5. **Ensure proper error handling**
6. **Update documentation for changes**

## 📄 License

This project is licensed under the MIT License - see the main project LICENSE file for details.

## 🔗 Related Documentation

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)