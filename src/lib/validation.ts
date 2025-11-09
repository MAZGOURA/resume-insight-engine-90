import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .optional();

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

// User registration validation
export const signUpSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User login validation
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code').optional(),
});

// Checkout validation
export const checkoutSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a complete address'),
  city: z.string().min(2, 'Please enter a valid city'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
});

// Product validation
export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  brand: z.string().min(2, 'Brand must be at least 2 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['men', 'women', 'unisex'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  size: z.string().min(1, 'Size is required'),
  notes: z.array(z.string()).min(1, 'At least one fragrance note is required'),
  stockQuantity: z.number().min(0, 'Stock quantity cannot be negative'),
  image: z.string().url('Please enter a valid image URL'),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  category: z.enum(['men', 'women', 'unisex', 'all']).optional(),
  sortBy: z.enum(['name', 'price', 'created_at']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Order status validation
export const orderStatusSchema = z.enum([
  'pending',
  'processing', 
  'shipped',
  'delivered',
  'cancelled'
]);

// Error handling utilities
export const getValidationError = (error: z.ZodError) => {
  const firstError = error.errors[0];
  return {
    field: firstError.path.join('.'),
    message: firstError.message,
  };
};

export const formatValidationErrors = (error: z.ZodError) => {
  return error.errors.reduce((acc, err) => {
    const field = err.path.join('.');
    acc[field] = err.message;
    return acc;
  }, {} as Record<string, string>);
};

// Custom validation functions
export const validateEmail = (email: string) => {
  return emailSchema.safeParse(email);
};

export const validatePassword = (password: string) => {
  return passwordSchema.safeParse(password);
};

export const validatePhone = (phone: string) => {
  return phoneSchema.safeParse(phone);
};

// Form field validation
export const validateField = (value: any, schema: z.ZodSchema) => {
  const result = schema.safeParse(value);
  return {
    isValid: result.success,
    error: result.success ? null : result.error.errors[0]?.message,
  };
};

// Async validation helpers
export const validateEmailExists = async (email: string) => {
  // This would typically check against your database
  // For now, we'll simulate an async check
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      // Simulate checking if email exists
      resolve(false);
    }, 1000);
  });
};

export const validateProductStock = async (productId: string, quantity: number) => {
  // This would check stock availability in your database
  return new Promise<boolean>((resolve) => {
    setTimeout(() => {
      // Simulate stock check
      resolve(true);
    }, 500);
  });
};
