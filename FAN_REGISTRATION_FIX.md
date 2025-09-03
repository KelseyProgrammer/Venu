# Fan Registration Fix

## Issue
The fan account registration was failing with a 400 Bad Request error due to validation issues with the name field.

## Root Cause
The backend validation schema required both `firstName` and `lastName` to be non-empty strings, but the frontend was splitting a single `name` field. When users entered only one name, `lastName` became an empty string, causing validation to fail.

## Solution

### Frontend Changes (src/components/auth-flow.tsx)
1. **Added client-side validation** to ensure the name field contains at least two words
2. **Improved error messaging** to guide users to enter their full name
3. **Updated placeholder text** to "First and last name" for clarity
4. **Added fallback handling** for edge cases

### Backend Changes (backend/src/validation/schemas.ts)
- Kept the strict validation to ensure data integrity
- The frontend now properly handles the name splitting before sending to the backend

## How to Test
1. Run the development setup: `./dev-setup.sh`
2. Navigate to the registration page
3. Try registering with:
   - Only first name (should show error)
   - Full name (should work)
   - Empty name (should show error)

## Environment Variables Required
The backend requires these environment variables:
- `JWT_SECRET`: At least 32 characters
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default 3001)

The `dev-setup.sh` script sets these automatically for development.
