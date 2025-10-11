# Fragrance Finesse App - Project Summary

## Overview
This is a comprehensive e-commerce application for selling fragrances with role-based access control for customers, drivers, and administrators.

## User Profiles

### 1. Customer Profile
- **Authentication**: Standard email/password signup and login
- **Profile Management**: Full name, email, phone, avatar, date of birth
- **Features**:
  - Browse products by categories and brands
  - Add products to cart and wishlist
  - Place orders with shipping and billing addresses
  - Track order status
  - Leave product reviews
  - Manage account settings and payment methods

### 2. Driver Profile
- **Authentication**: Special driver login with role verification
- **Profile Management**: Full name, phone, license number, vehicle details
- **Features**:
  - View assigned delivery orders
  - Update delivery status (picked up, delivered)
  - View payment information
  - Manage driver account settings

### 3. Administrator Profile
- **Authentication**: Admin login with role verification
- **Profile Management**: Full access to all system data
- **Features**:
  - Manage products, categories, and brands
  - View and manage all orders
  - Manage customer accounts
  - Assign drivers to orders
  - Process driver payments
  - View analytics and reports
  - Configure system settings

## Pages Structure

### Public Pages
- **Home** (`/`): Main landing page with featured products
- **Product Mall** (`/mall`): Browse all products
- **Product Detail** (`/product/:id`): Detailed view of a specific product
- **About** (`/about`): Company information
- **Contact** (`/contact`): Contact form
- **FAQ** (`/faq`): Frequently asked questions
- **Authentication** (`/auth`, `/login`, `/signup`): User registration and login
- **Forgot Password** (`/forgot-password`): Password recovery

### Customer Pages (Protected)
- **Account Dashboard** (`/account`): Overview of account activity
- **Profile Management** (`/account/profile`): Update personal information
- **Order History** (`/account/orders`): View past and current orders
- **Wishlist** (`/account/wishlist`): Saved products
- **Shipping Addresses** (`/account/shipping`): Manage delivery addresses
- **Notifications** (`/account/notifications`): Notification preferences
- **Payment Methods** (`/account/payment-methods`): Manage payment options
- **Security Settings** (`/account/security`): Password and security settings
- **Shopping Cart** (`/cart`): Review selected items
- **Checkout** (`/checkout`): Complete purchase process
- **Order Confirmation** (`/order-confirmation/:orderId`): Purchase confirmation

### Driver Pages (Protected)
- **Driver Login** (`/driver/login`): Special login for delivery drivers
- **Driver Dashboard** (`/driver/dashboard`): Overview of assigned deliveries
- **Driver Payments** (`/driver/payments`): View payment history and status

### Admin Pages (Protected)
- **Admin Login** (`/admin/login`): Special login for administrators
- **Admin Dashboard** (`/admin/dashboard`): System overview and analytics
- **Product Management** (`/admin/products`): Add, edit, and remove products
- **Order Management** (`/admin/orders`): View and manage all orders
- **Customer Management** (`/admin/customers`): View and manage customer accounts
- **Category Management** (`/admin/categories`): Manage product categories
- **Driver Management** (`/admin/drivers`): Manage delivery drivers
- **Driver Assignments** (`/admin/driver-assignments`): Assign orders to drivers
- **Driver Payments** (`/admin/driver-payments`): Process driver payments
- **Analytics** (`/admin/analytics`): View business metrics and reports
- **System Settings** (`/admin/settings`): Configure application settings

## Core Logic

### Authentication Flow
1. **User Registration**:
   - Customers sign up through the standard auth flow
   - System creates user record, profile, and assigns customer role

2. **User Login**:
   - All users authenticate through email/password
   - System checks user roles to determine access level
   - Redirects to appropriate dashboard based on role

3. **Role Verification**:
   - Admins: Verified through [user_roles](file:///D:/DONNEES/Telechargements/Nouveau%20dossier/fragrance-finesse-app/src/integrations/supabase/types.ts#L859-L870) table
   - Drivers: Verified through [delivery_drivers](file:///D:/DONNEES/Telechargements/Nouveau%20dossier/fragrance-finesse-app/supabase/migrations/20251011000000_ecommerce_schema_final.sql#L355-L366) table
   - Customers: Default role for authenticated users

### Shopping Flow
1. **Product Browsing**: Users can browse products by category or brand
2. **Cart Management**: Add/remove items, update quantities
3. **Checkout Process**: 
   - Select or add shipping address
   - Apply coupons/discounts
   - Select payment method
   - Confirm order
4. **Order Processing**: 
   - Orders created with pending status
   - Payment processing
   - Inventory updates
   - Driver assignment for delivery

### Order Management
1. **Status Tracking**: Orders progress through statuses (pending → confirmed → processing → shipped → delivered)
2. **Driver Assignment**: Admins assign orders to drivers for delivery
3. **Delivery Updates**: Drivers update status as they pick up and deliver orders
4. **Payment Processing**: System tracks payment status and processes refunds when needed

### Data Management
1. **Products**: Managed by admins with inventory tracking
2. **Inventory**: Real-time stock tracking with reorder level alerts
3. **Categories/Brands**: Hierarchical product organization
4. **Coupons**: Discount codes with usage limits and expiration dates
5. **Reviews**: Customer feedback with approval workflow

## Database Schema Highlights

### Core Tables
- **users**: Basic user information from authentication
- **profiles**: Extended user profile information
- **user_roles**: Role-based access control (admin, customer, driver)
- **delivery_drivers**: Driver-specific information
- **products**: Product catalog with pricing and inventory
- **categories/brands**: Product categorization
- **orders/order_items**: Customer orders and items
- **addresses**: User shipping and billing addresses
- **cart_items**: Shopping cart contents
- **wishlists**: Saved products
- **reviews**: Product feedback
- **coupons**: Discount codes
- **inventory**: Stock tracking
- **payments**: Payment processing records
- **invoices**: Billing documents
- **driver_assignments**: Order-to-driver mapping
- **driver_payments**: Driver compensation tracking

### Key Features
- **Row Level Security (RLS)**: Ensures users only access authorized data
- **Triggers**: Automatic timestamp updates
- **Indexes**: Optimized for common query patterns
- **ENUM Types**: Standardized status values
- **Foreign Key Constraints**: Data integrity