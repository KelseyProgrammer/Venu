import { z } from 'zod';

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long'),
  role: z.enum(['fan', 'artist', 'promoter', 'door', 'location'], {
    errorMap: () => ({ message: 'Invalid role. Must be one of: fan, artist, promoter, door, location' })
  }),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').trim(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').trim(),
  phone: z.string().optional().refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), {
    message: 'Invalid phone number format'
  })
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').trim().optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').trim().optional(),
  phone: z.string().optional().refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), {
    message: 'Invalid phone number format'
  }),
  profileImage: z.string().url('Invalid image URL').optional()
});

// Gig validation schemas
export const createGigSchema = z.object({
  eventName: z.string().min(1, 'Event name is required').max(100, 'Event name too long').trim(),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  eventTime: z.string().min(1, 'Event time is required'),
  eventGenre: z.string().min(1, 'Event genre is required').max(50, 'Genre too long').trim(),
  ticketCapacity: z.number().int().min(1, 'Capacity must be at least 1').max(10000, 'Capacity too large'),
  ticketPrice: z.number().min(0, 'Price cannot be negative').max(1000, 'Price too high'),
  selectedLocation: z.string().optional(),
  selectedPromoter: z.string().optional(),
  promoterEmail: z.string().email('Invalid promoter email').optional(),
  promoterPercentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100').optional(),
  selectedDoorPerson: z.string().min(1, 'Door person is required'),
  doorPersonEmail: z.string().email('Invalid door person email').min(1, 'Door person email is required'),
  requirements: z.array(z.object({
    text: z.string().min(1, 'Requirement text is required').max(200, 'Requirement too long'),
    checked: z.boolean().default(false)
  })).min(1, 'At least one requirement is needed'),
  bands: z.array(z.object({
    name: z.string().min(1, 'Band name is required').max(100, 'Band name too long').trim(),
    genre: z.string().min(1, 'Band genre is required').max(50, 'Genre too long').trim(),
    setTime: z.string().min(1, 'Set time is required'),
    percentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100'),
    email: z.string().email('Invalid band email').min(1, 'Band email is required')
  })).min(1, 'At least one band is required'),
  guarantee: z.number().min(0, 'Guarantee cannot be negative').max(100000, 'Guarantee too high'),
  numberOfBands: z.number().int().min(1, 'Number of bands must be at least 1').max(20, 'Too many bands'),
  tags: z.array(z.string().trim()).optional(),
  image: z.string().url('Invalid image URL').optional(),
  bonusTiers: z.object({
    tier1: z.object({
      amount: z.number().min(0, 'Amount cannot be negative'),
      threshold: z.number().min(0, 'Threshold cannot be negative'),
      color: z.string().min(1, 'Color is required')
    }),
    tier2: z.object({
      amount: z.number().min(0, 'Amount cannot be negative'),
      threshold: z.number().min(0, 'Threshold cannot be negative'),
      color: z.string().min(1, 'Color is required')
    }),
    tier3: z.object({
      amount: z.number().min(0, 'Amount cannot be negative'),
      threshold: z.number().min(0, 'Threshold cannot be negative'),
      color: z.string().min(1, 'Color is required')
    })
  }).optional()
});

export const updateGigSchema = createGigSchema.partial().extend({
  id: z.string().min(1, 'Gig ID is required')
});

// Location validation schemas
export const createLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required').max(100, 'Name too long').trim(),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long').trim(),
  city: z.string().min(1, 'City is required').max(50, 'City name too long').trim(),
  state: z.string().min(1, 'State is required').max(50, 'State name too long').trim(),
  zipCode: z.string().min(1, 'ZIP code is required').max(10, 'ZIP code too long').trim(),
  country: z.string().min(1, 'Country is required').max(50, 'Country name too long').trim().default('USA'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(50000, 'Capacity too large'),
  description: z.string().max(1000, 'Description too long').trim().optional(),
  amenities: z.array(z.string().trim()).optional(),
  contactPerson: z.string().min(1, 'Contact person is required').max(100, 'Name too long').trim(),
  contactEmail: z.string().email('Invalid contact email').min(1, 'Contact email is required'),
  contactPhone: z.string().min(1, 'Contact phone is required').max(20, 'Phone number too long').trim(),
  images: z.array(z.string().url('Invalid image URL')).optional(),
  rating: z.number().min(0, 'Rating cannot be negative').max(5, 'Rating cannot exceed 5').optional(),
  tags: z.array(z.string().trim()).optional(),
  isActive: z.boolean().optional()
});

export const updateLocationSchema = createLocationSchema.partial().extend({
  id: z.string().min(1, 'Location ID is required')
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val, 10) : 1).refine((val) => val > 0, {
    message: 'Page must be greater than 0'
  }),
  limit: z.string().optional().transform((val) => val ? parseInt(val, 10) : 10).refine((val) => val > 0 && val <= 100, {
    message: 'Limit must be between 1 and 100'
  })
});

export const gigQuerySchema = paginationSchema.extend({
  status: z.enum(['draft', 'posted', 'live', 'completed']).optional(),
  genre: z.string().optional(),
  location: z.string().optional(),
  promoter: z.string().optional()
});

export const locationQuerySchema = paginationSchema.extend({
  city: z.string().optional(),
  state: z.string().optional(),
  capacity: z.string().optional().transform((val) => val ? parseInt(val, 10) : undefined),
  isActive: z.string().optional().transform((val) => val === 'true')
});

export const userQuerySchema = paginationSchema.extend({
  role: z.enum(['fan', 'artist', 'promoter', 'door', 'location']).optional(),
  search: z.string().optional()
});

// Type exports for use in route handlers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateGigInput = z.infer<typeof createGigSchema>;
export type UpdateGigInput = z.infer<typeof updateGigSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type GigQueryInput = z.infer<typeof gigQuerySchema>;
export type LocationQueryInput = z.infer<typeof locationQuerySchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
